using AutoMapper;
using ERP.Application.Cadastros.Produtos;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Estoque;

public class EstoqueService(
    IRepository<Produto> produtoRepository,
    IRepository<Fornecedor> fornecedorRepository,
    IMovimentacaoEstoqueRepository movimentacaoRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IEstoqueService
{
    public async Task<Result<MovimentacaoEstoqueResponseDto>> EntradaMercadoriaAsync(
        EntradaMercadoriaDto dto, string criadoPor, CancellationToken ct = default)
    {
        var produto = await produtoRepository.GetByIdAsync(dto.ProdutoId, ct);
        if (produto is null)
            return Result<MovimentacaoEstoqueResponseDto>.NotFound("Produto não encontrado.");

        if (dto.FornecedorId.HasValue &&
            !await fornecedorRepository.ExistsAsync(f => f.Id == dto.FornecedorId.Value, ct))
            return Result<MovimentacaoEstoqueResponseDto>.NotFound("Fornecedor não encontrado.");

        MovimentacaoEstoque mov;
        try
        {
            mov = MovimentacaoEstoque.Criar(
                produto,
                TipoMovimentacaoEstoque.Entrada,
                dto.Quantidade,
                MotivoMovimentacaoEstoque.CompraFornecedor,
                descricao: null,
                dto.NumeroNF,
                criadoPor);
        }
        catch (InvalidOperationException ex)
        {
            return Result<MovimentacaoEstoqueResponseDto>.Fail(ex.Message);
        }

        // Atualiza custo unitário do produto com base na NF recebida
        if (dto.CustoUnitario > 0)
            produto.AtualizarPrecos(dto.CustoUnitario, produto.PrecoVenda, criadoPor);

        await movimentacaoRepository.AddAsync(mov, ct);
        await produtoRepository.UpdateAsync(produto, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<MovimentacaoEstoqueResponseDto>.Ok(
            mapper.Map<MovimentacaoEstoqueResponseDto>(mov));
    }

    public async Task<Result<MovimentacaoEstoqueResponseDto>> SaidaManualAsync(
        SaidaManualDto dto, string criadoPor, CancellationToken ct = default)
    {
        var produto = await produtoRepository.GetByIdAsync(dto.ProdutoId, ct);
        if (produto is null)
            return Result<MovimentacaoEstoqueResponseDto>.NotFound("Produto não encontrado.");

        MovimentacaoEstoque mov;
        try
        {
            mov = MovimentacaoEstoque.Criar(
                produto,
                TipoMovimentacaoEstoque.Saida,
                dto.Quantidade,
                MotivoMovimentacaoEstoque.SaidaManual,
                dto.Descricao,
                documentoOrigem: null,
                criadoPor);
        }
        catch (InvalidOperationException ex)
        {
            return Result<MovimentacaoEstoqueResponseDto>.Fail(ex.Message);
        }

        await movimentacaoRepository.AddAsync(mov, ct);
        await produtoRepository.UpdateAsync(produto, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<MovimentacaoEstoqueResponseDto>.Ok(
            mapper.Map<MovimentacaoEstoqueResponseDto>(mov));
    }

    public async Task<Result<ResultadoAjusteInventarioDto>> AjusteInventarioAsync(
        AjusteInventarioDto dto, string criadoPor, CancellationToken ct = default)
    {
        // Carrega todos os produtos antes de iniciar para abortar cedo se algum não existir
        var produtos = new Dictionary<Guid, Produto>();
        foreach (var id in dto.Itens.Select(i => i.ProdutoId))
        {
            var produto = await produtoRepository.GetByIdAsync(id, ct);
            if (produto is null)
                return Result<ResultadoAjusteInventarioDto>.NotFound(
                    $"Produto '{id}' não encontrado.");
            produtos[id] = produto;
        }

        var movimentacoes = new List<MovimentacaoEstoque>();
        var produtosModificados = new HashSet<Guid>();
        var ignorados = 0;

        foreach (var item in dto.Itens)
        {
            var produto = produtos[item.ProdutoId];

            if (produto.EstoqueAtual == item.QuantidadeReal)
            {
                ignorados++;
                continue;
            }

            try
            {
                var mov = MovimentacaoEstoque.Criar(
                    produto,
                    TipoMovimentacaoEstoque.Inventario,
                    item.QuantidadeReal,
                    MotivoMovimentacaoEstoque.InventarioPeriodico,
                    dto.Descricao,
                    documentoOrigem: null,
                    criadoPor);

                movimentacoes.Add(mov);
                produtosModificados.Add(item.ProdutoId);
            }
            catch (InvalidOperationException ex)
            {
                return Result<ResultadoAjusteInventarioDto>.Fail(ex.Message);
            }
        }

        foreach (var mov in movimentacoes)
            await movimentacaoRepository.AddAsync(mov, ct);

        foreach (var id in produtosModificados)
            await produtoRepository.UpdateAsync(produtos[id], ct);

        await unitOfWork.SaveChangesAsync(ct);

        return Result<ResultadoAjusteInventarioDto>.Ok(new ResultadoAjusteInventarioDto(
            TotalItens: dto.Itens.Count,
            ItensAjustados: movimentacoes.Count,
            ItensIgnorados: ignorados,
            Movimentacoes: mapper.Map<List<MovimentacaoEstoqueResponseDto>>(movimentacoes)));
    }

    public async Task<Result<IReadOnlyList<PosicaoEstoqueItemDto>>> ObterPosicaoEstoqueAsync(
        CancellationToken ct = default)
    {
        var produtos = await produtoRepository.GetAllAsync(ct);

        var posicao = produtos
            .Select(ToPosicaoItem)
            .OrderByDescending(p => p.Situacao)   // Zerado(3) → Baixo(2) → OK(1)
            .ThenBy(p => p.Nome)
            .ToList();

        return Result<IReadOnlyList<PosicaoEstoqueItemDto>>.Ok(posicao);
    }

    public async Task<Result<IReadOnlyList<PosicaoEstoqueItemDto>>> ObterAlertasEstoqueMinimoAsync(
        CancellationToken ct = default)
    {
        var produtos = await produtoRepository.FindAsync(
            p => p.EstoqueAtual <= 0 || p.EstoqueAtual < p.EstoqueMinimo, ct);

        var alertas = produtos
            .Select(ToPosicaoItem)
            .OrderByDescending(p => p.Situacao)
            .ThenBy(p => p.Nome)
            .ToList();

        return Result<IReadOnlyList<PosicaoEstoqueItemDto>>.Ok(alertas);
    }

    public async Task<Result<PagedResult<MovimentacaoEstoqueResponseDto>>> GetMovimentacoesAsync(
        int page, int pageSize,
        Guid? produtoId = null,
        TipoMovimentacaoEstoque? tipo = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default)
    {
        var (items, total) = await movimentacaoRepository.GetPagedComProdutoAsync(
            page, pageSize,
            filter: m =>
                (produtoId == null || m.ProdutoId == produtoId) &&
                (tipo == null || m.Tipo == tipo) &&
                (dataInicio == null || m.CreatedAt >= dataInicio) &&
                (dataFim == null || m.CreatedAt <= dataFim),
            ct: ct);

        return Result<PagedResult<MovimentacaoEstoqueResponseDto>>.Ok(
            PagedResult<MovimentacaoEstoqueResponseDto>.Create(
                mapper.Map<List<MovimentacaoEstoqueResponseDto>>(items), total, page, pageSize));
    }

    private static PosicaoEstoqueItemDto ToPosicaoItem(Produto p) => new(
        p.Id, p.Nome, p.Sku, p.CodigoBarras,
        p.EstoqueAtual, p.EstoqueMinimo,
        p.UnidadeMedida.ToString(),
        p.EstoqueAtual <= 0
            ? SituacaoEstoque.Zerado
            : p.EstoqueAbaixoDoMinimo
                ? SituacaoEstoque.Baixo
                : SituacaoEstoque.OK);
}
