using AutoMapper;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Vendas;

public class VendaService(
    IVendaRepository vendaRepository,
    IRepository<Produto> produtoRepository,
    IRepository<Funcionario> funcionarioRepository,
    IRepository<Cliente> clienteRepository,
    IRepository<MovimentacaoEstoque> movimentacaoRepository,
    IRepository<ContaReceber> contaReceberRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IVendaService
{
    public async Task<Result<VendaResponseDto>> CriarOrcamentoAsync(
        CriarOrcamentoDto dto, string criadoPor, CancellationToken ct = default)
    {
        if (!await funcionarioRepository.ExistsAsync(f => f.Id == dto.FuncionarioId, ct))
            return Result<VendaResponseDto>.NotFound("Funcionário não encontrado.");

        if (dto.ClienteId.HasValue &&
            !await clienteRepository.ExistsAsync(c => c.Id == dto.ClienteId.Value, ct))
            return Result<VendaResponseDto>.NotFound("Cliente não encontrado.");

        var venda = Venda.Create(dto.ClienteId, dto.FuncionarioId, dto.Observacao, criadoPor);

        foreach (var itemDto in dto.Itens)
        {
            var produto = await produtoRepository.GetByIdAsync(itemDto.ProdutoId, ct);
            if (produto is null)
                return Result<VendaResponseDto>.NotFound($"Produto '{itemDto.ProdutoId}' não encontrado.");

            var precoUnitario = itemDto.PrecoUnitario ?? produto.PrecoVenda;

            try { venda.AdicionarItem(produto, itemDto.Quantidade, precoUnitario, itemDto.Desconto, criadoPor); }
            catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }
        }

        await vendaRepository.AddAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<VendaResponseDto>.Created(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result<VendaResponseDto>> AdicionarItemAsync(
        Guid vendaId, AdicionarItemVendaDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(vendaId, ct);
        if (venda is null)
            return Result<VendaResponseDto>.NotFound("Venda não encontrada.");

        var produto = await produtoRepository.GetByIdAsync(dto.ProdutoId, ct);
        if (produto is null)
            return Result<VendaResponseDto>.NotFound("Produto não encontrado.");

        var precoUnitario = dto.PrecoUnitario ?? produto.PrecoVenda;

        try { venda.AdicionarItem(produto, dto.Quantidade, precoUnitario, dto.Desconto, atualizadoPor); }
        catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }

        await vendaRepository.UpdateAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<VendaResponseDto>.Ok(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result<VendaResponseDto>> RemoverItemAsync(
        Guid vendaId, Guid itemId, string atualizadoPor, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(vendaId, ct);
        if (venda is null)
            return Result<VendaResponseDto>.NotFound("Venda não encontrada.");

        try { venda.RemoverItem(itemId, atualizadoPor); }
        catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }

        await vendaRepository.UpdateAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<VendaResponseDto>.Ok(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result<VendaResponseDto>> AplicarDescontoAsync(
        Guid vendaId, AplicarDescontoDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(vendaId, ct);
        if (venda is null)
            return Result<VendaResponseDto>.NotFound("Venda não encontrada.");

        try { venda.AplicarDesconto(dto.Percentual, atualizadoPor); }
        catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }

        await vendaRepository.UpdateAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<VendaResponseDto>.Ok(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result<VendaResponseDto>> FinalizarAsync(
        Guid vendaId, FinalizarVendaDto dto, string finalizadoPor, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(vendaId, ct);
        if (venda is null)
            return Result<VendaResponseDto>.NotFound("Venda não encontrada.");

        if (venda.Status != StatusVenda.Orcamento)
            return Result<VendaResponseDto>.Fail("Apenas orçamentos podem ser finalizados.");

        if (venda.Itens.Count == 0)
            return Result<VendaResponseDto>.Fail("A venda deve ter pelo menos um item.");

        // Valida total dos pagamentos >= total da venda
        var totalPagamentos = dto.Pagamentos.Sum(p => p.Valor);
        if (totalPagamentos < venda.Total)
            return Result<VendaResponseDto>.Fail(
                $"Total dos pagamentos (R$ {totalPagamentos:F2}) menor que o total da venda (R$ {venda.Total:F2}).");

        // Verifica estoque atual de cada item (pode ter mudado desde que o orçamento foi criado)
        var produtos = new Dictionary<Guid, Produto>();
        foreach (var item in venda.Itens)
        {
            var produto = await produtoRepository.GetByIdAsync(item.ProdutoId, ct);
            if (produto is null)
                return Result<VendaResponseDto>.Fail($"Produto '{item.ProdutoId}' não encontrado.");

            if (produto.EstoqueAtual < item.Quantidade)
                return Result<VendaResponseDto>.Fail(
                    $"Estoque insuficiente para '{produto.Nome}'. " +
                    $"Disponível: {produto.EstoqueAtual}, solicitado: {item.Quantidade}.");

            produtos[produto.Id] = produto;
        }

        // Adiciona pagamentos ao aggregate
        foreach (var pagamentoDto in dto.Pagamentos)
        {
            try
            {
                venda.AdicionarPagamento(
                    pagamentoDto.Forma, pagamentoDto.Valor,
                    pagamentoDto.Parcelas, pagamentoDto.TaxaJuros, finalizadoPor);
            }
            catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }
        }

        // Confirma a venda (muda status e seta DataVenda)
        try { venda.Confirmar(finalizadoPor); }
        catch (InvalidOperationException ex) { return Result<VendaResponseDto>.Fail(ex.Message); }

        // Cria movimentações de saída de estoque
        foreach (var item in venda.Itens)
        {
            var produto = produtos[item.ProdutoId];
            var mov = MovimentacaoEstoque.Criar(
                produto,
                TipoMovimentacaoEstoque.Saida,
                item.Quantidade,
                MotivoMovimentacaoEstoque.VendaPdv,
                descricao: null,
                documentoOrigem: venda.Numero.ToString(),
                criadoPor: finalizadoPor);

            await produtoRepository.UpdateAsync(produto, ct);
            await movimentacaoRepository.AddAsync(mov, ct);
        }

        // Gera ContaReceber para cada forma de pagamento
        foreach (var pagamento in venda.Pagamentos)
        {
            foreach (var conta in GerarContasReceber(venda, pagamento, finalizadoPor))
                await contaReceberRepository.AddAsync(conta, ct);
        }

        await vendaRepository.UpdateAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<VendaResponseDto>.Ok(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result> CancelarAsync(
        Guid vendaId, CancelarVendaDto dto, string canceladoPor, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(vendaId, ct);
        if (venda is null)
            return Result.NotFound("Venda não encontrada.");

        // Guarda o status antes de cancelar para saber se precisa estornar estoque
        var eraConfirmada = venda.Status == StatusVenda.Confirmada;

        try { venda.Cancelar(canceladoPor); }
        catch (InvalidOperationException ex) { return Result.Fail(ex.Message); }

        // Estorna estoque somente se a venda havia sido confirmada (e o estoque foi debitado)
        if (eraConfirmada)
        {
            foreach (var item in venda.Itens)
            {
                var produto = await produtoRepository.GetByIdAsync(item.ProdutoId, ct);
                if (produto is null) continue;

                var mov = MovimentacaoEstoque.Criar(
                    produto,
                    TipoMovimentacaoEstoque.Entrada,
                    item.Quantidade,
                    MotivoMovimentacaoEstoque.DevolucaoCliente,
                    descricao: dto.Motivo,
                    documentoOrigem: venda.Numero.ToString(),
                    criadoPor: canceladoPor);

                await produtoRepository.UpdateAsync(produto, ct);
                await movimentacaoRepository.AddAsync(mov, ct);
            }

            // Cancela contas a receber ainda em aberto
            var contasAbertas = await contaReceberRepository.FindAsync(
                cr => cr.VendaId == vendaId && cr.Status == StatusContaReceber.Aberta, ct);

            foreach (var conta in contasAbertas)
            {
                conta.Cancelar(canceladoPor);
                await contaReceberRepository.UpdateAsync(conta, ct);
            }
        }

        await vendaRepository.UpdateAsync(venda, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result.Ok(204);
    }

    public async Task<Result<VendaResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var venda = await vendaRepository.GetByIdComItensAsync(id, ct);
        if (venda is null)
            return Result<VendaResponseDto>.NotFound("Venda não encontrada.");

        return Result<VendaResponseDto>.Ok(mapper.Map<VendaResponseDto>(venda));
    }

    public async Task<Result<PagedResult<VendaResponseDto>>> GetPagedAsync(
        int page, int pageSize,
        StatusVenda? status = null,
        Guid? clienteId = null,
        Guid? funcionarioId = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default)
    {
        var inicioUtc = dataInicio.HasValue
    ? DateTime.SpecifyKind(dataInicio.Value, DateTimeKind.Utc)
    : (DateTime?)null;
var fimUtc = dataFim.HasValue
    ? DateTime.SpecifyKind(dataFim.Value, DateTimeKind.Utc)
    : (DateTime?)null;

var (items, total) = await vendaRepository.GetPagedComFiltroAsync(
    page, pageSize, status, clienteId, funcionarioId, inicioUtc, fimUtc, ct);

        return Result<PagedResult<VendaResponseDto>>.Ok(
            PagedResult<VendaResponseDto>.Create(
                mapper.Map<List<VendaResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<ResumoDiaDto>> GetResumoDiaAsync(CancellationToken ct = default)
    {
        var hoje = DateTime.UtcNow.Date;
        var (totalVendido, quantidade) = await vendaRepository.GetResumoDiaAsync(hoje, ct);
        var ticketMedio = quantidade > 0 ? Math.Round(totalVendido / quantidade, 2) : 0m;
        return Result<ResumoDiaDto>.Ok(new ResumoDiaDto(hoje, quantidade, totalVendido, ticketMedio));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static IReadOnlyList<ContaReceber> GerarContasReceber(
        Venda venda, Pagamento pagamento, string criadoPor)
    {
        var contas = new List<ContaReceber>();

        var pagamentoImediato = pagamento.Forma is
            FormaPagamento.Dinheiro or FormaPagamento.Pix or FormaPagamento.Debito;

        if (pagamentoImediato)
        {
            contas.Add(ContaReceber.Create(
                venda.Id, venda.ClienteId, pagamento.Forma,
                $"Venda #{venda.Numero} - {pagamento.Forma}",
                pagamento.Valor,
                numeroParcela: 1, totalParcelas: 1,
                dataVencimento: venda.DataVenda,
                jaPaga: true,
                criadoPor));
            return contas;
        }

        // Crédito ou Crediário — gera N parcelas com vencimento a cada 30 dias
        var valorParcela = Math.Round(pagamento.Valor / pagamento.Parcelas, 2);
        var diferenca    = pagamento.Valor - valorParcela * pagamento.Parcelas;

        for (var i = 1; i <= pagamento.Parcelas; i++)
        {
            var valor      = i == pagamento.Parcelas ? valorParcela + diferenca : valorParcela;
            var vencimento = venda.DataVenda.AddDays(30 * i);

            contas.Add(ContaReceber.Create(
                venda.Id, venda.ClienteId, pagamento.Forma,
                $"Venda #{venda.Numero} - {pagamento.Forma} - Parcela {i}/{pagamento.Parcelas}",
                valor,
                numeroParcela: i, totalParcelas: pagamento.Parcelas,
                dataVencimento: vencimento,
                jaPaga: false,
                criadoPor));
        }

        return contas;
    }
}
