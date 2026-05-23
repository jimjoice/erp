using AutoMapper;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Application.Vendas;
using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Financeiro;

public class FinanceiroService(
    IRepository<ContaReceber> contaReceberRepository,
    IRepository<ContaPagar> contaPagarRepository,
    IRepository<LancamentoCaixa> lancamentoCaixaRepository,
    IRepository<Cliente> clienteRepository,
    IRepository<Fornecedor> fornecedorRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IFinanceiroService
{
    public async Task<Result<PagedResult<ContaReceberResponseDto>>> GetContasReceberAsync(
        int page, int pageSize,
        StatusContaReceber? status, Guid? clienteId,
        DateTime? dataInicio, DateTime? dataFim,
        CancellationToken ct = default)
    {
        var fimExclusivo = dataFim.HasValue ? dataFim.Value.AddDays(1) : (DateTime?)null;

        var (items, total) = await contaReceberRepository.GetPagedAsync(
            page, pageSize,
            cr => (!status.HasValue     || cr.Status == status.Value) &&
                  (!clienteId.HasValue  || cr.ClienteId == clienteId) &&
                  (!dataInicio.HasValue || cr.DataVencimento >= dataInicio.Value) &&
                  (!fimExclusivo.HasValue || cr.DataVencimento < fimExclusivo.Value),
            ct);

        return Result<PagedResult<ContaReceberResponseDto>>.Ok(
            PagedResult<ContaReceberResponseDto>.Create(
                mapper.Map<List<ContaReceberResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<PagedResult<ContaPagarResponseDto>>> GetContasPagarAsync(
        int page, int pageSize,
        StatusContaPagar? status, Guid? fornecedorId,
        DateTime? dataInicio, DateTime? dataFim,
        CancellationToken ct = default)
    {
        var fimExclusivo = dataFim.HasValue ? dataFim.Value.AddDays(1) : (DateTime?)null;

        var (items, total) = await contaPagarRepository.GetPagedAsync(
            page, pageSize,
            cp => (!status.HasValue      || cp.Status == status.Value) &&
                  (!fornecedorId.HasValue || cp.FornecedorId == fornecedorId.Value) &&
                  (!dataInicio.HasValue   || cp.DataVencimento >= dataInicio.Value) &&
                  (!fimExclusivo.HasValue  || cp.DataVencimento < fimExclusivo.Value),
            ct);

        return Result<PagedResult<ContaPagarResponseDto>>.Ok(
            PagedResult<ContaPagarResponseDto>.Create(
                mapper.Map<List<ContaPagarResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<ContaReceberResponseDto>> BaixarContaReceberAsync(
        Guid id, BaixarContaDto dto, string usuario, CancellationToken ct = default)
    {
        var conta = await contaReceberRepository.GetByIdAsync(id, ct);
        if (conta is null)
            return Result<ContaReceberResponseDto>.NotFound("Conta a receber não encontrada.");

        try { conta.Pagar(dto.DataPagamento, usuario); }
        catch (InvalidOperationException ex) { return Result<ContaReceberResponseDto>.Fail(ex.Message); }

        var lancamento = LancamentoCaixa.Create(
            TipoLancamentoCaixa.Entrada,
            dto.ValorPago,
            $"Baixa: {conta.Descricao}",
            usuario,
            contaReceberId: conta.Id);

        await contaReceberRepository.UpdateAsync(conta, ct);
        await lancamentoCaixaRepository.AddAsync(lancamento, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<ContaReceberResponseDto>.Ok(mapper.Map<ContaReceberResponseDto>(conta));
    }

    public async Task<Result<ContaPagarResponseDto>> BaixarContaPagarAsync(
        Guid id, BaixarContaDto dto, string usuario, CancellationToken ct = default)
    {
        var conta = await contaPagarRepository.GetByIdAsync(id, ct);
        if (conta is null)
            return Result<ContaPagarResponseDto>.NotFound("Conta a pagar não encontrada.");

        try { conta.Pagar(dto.DataPagamento, usuario); }
        catch (InvalidOperationException ex) { return Result<ContaPagarResponseDto>.Fail(ex.Message); }

        var lancamento = LancamentoCaixa.Create(
            TipoLancamentoCaixa.Saida,
            dto.ValorPago,
            $"Baixa: {conta.Descricao}",
            usuario,
            contaPagarId: conta.Id);

        await contaPagarRepository.UpdateAsync(conta, ct);
        await lancamentoCaixaRepository.AddAsync(lancamento, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<ContaPagarResponseDto>.Ok(mapper.Map<ContaPagarResponseDto>(conta));
    }

    public async Task<Result<FluxoCaixaDto>> FluxoCaixaAsync(
        DateTime dataInicio, DateTime dataFim, CancellationToken ct = default)
    {
        if (dataFim.Date < dataInicio.Date)
            return Result<FluxoCaixaDto>.Fail("Data fim deve ser maior ou igual à data início.");

        var inicio = DateTime.SpecifyKind(dataInicio.Date, DateTimeKind.Utc);
var fim    = DateTime.SpecifyKind(dataFim.Date.AddDays(1), DateTimeKind.Utc);

        // Saldo acumulado de todos os lançamentos antes do período
        var anteriores = await lancamentoCaixaRepository.FindAsync(
            lc => lc.CreatedAt < inicio, ct);

        var saldoInicial = anteriores.Sum(l =>
            l.Tipo == TipoLancamentoCaixa.Entrada ? l.Valor : -l.Valor);

        // Lançamentos do período
        var periodo = await lancamentoCaixaRepository.FindAsync(
            lc => lc.CreatedAt >= inicio && lc.CreatedAt < fim, ct);

        var entradas = periodo.Where(l => l.Tipo == TipoLancamentoCaixa.Entrada).Sum(l => l.Valor);
        var saidas   = periodo.Where(l => l.Tipo == TipoLancamentoCaixa.Saida).Sum(l => l.Valor);

        var lancamentosDto = mapper.Map<List<LancamentoCaixaResponseDto>>(
            periodo.OrderBy(l => l.CreatedAt).ToList());

        return Result<FluxoCaixaDto>.Ok(new FluxoCaixaDto(
            inicio, dataFim.Date,
            Math.Round(saldoInicial, 2),
            Math.Round(entradas, 2),
            Math.Round(saidas, 2),
            Math.Round(saldoInicial + entradas - saidas, 2),
            lancamentosDto));
    }

    public async Task<Result<ContasVencendoDto>> ContasVencendoAsync(
        int dias = 7, CancellationToken ct = default)
    {
        if (dias < 0)
            return Result<ContasVencendoDto>.Fail("O número de dias deve ser maior ou igual a zero.");

        var hoje   = DateTime.UtcNow.Date;
        var limite = hoje.AddDays(dias);

        // Inclui vencidas (já passadas) e abertas até o limite
        var contasReceber = await contaReceberRepository.FindAsync(
            cr => (cr.Status == StatusContaReceber.Aberta || cr.Status == StatusContaReceber.Vencida)
                  && cr.DataVencimento.Date <= limite,
            ct);

        var contasPagar = await contaPagarRepository.FindAsync(
            cp => (cp.Status == StatusContaPagar.Aberta || cp.Status == StatusContaPagar.Vencida)
                  && cp.DataVencimento.Date <= limite,
            ct);

        // Carrega clientes e fornecedores em lote para evitar N+1
        var clienteIds = contasReceber
            .Where(cr => cr.ClienteId.HasValue)
            .Select(cr => cr.ClienteId!.Value)
            .Distinct()
            .ToList();

        var fornecedorIds = contasPagar
            .Select(cp => cp.FornecedorId)
            .Distinct()
            .ToList();

        var clienteMap = clienteIds.Any()
            ? (await clienteRepository.FindAsync(c => clienteIds.Contains(c.Id), ct))
              .ToDictionary(c => c.Id, c => c.Nome)
            : new Dictionary<Guid, string>();

        var fornecedorMap = fornecedorIds.Any()
            ? (await fornecedorRepository.FindAsync(f => fornecedorIds.Contains(f.Id), ct))
              .ToDictionary(f => f.Id, f => f.RazaoSocial)
            : new Dictionary<Guid, string>();

        var contasReceberDto = contasReceber
            .OrderBy(cr => cr.DataVencimento)
            .Select(cr => new ContaReceberVencendoDto(
                cr.Id,
                cr.VendaId,
                cr.ClienteId,
                cr.ClienteId.HasValue && clienteMap.TryGetValue(cr.ClienteId.Value, out var cn) ? cn : null,
                cr.Descricao,
                cr.Valor,
                cr.DataVencimento,
                cr.Status.ToString(),
                (cr.DataVencimento.Date - hoje).Days))
            .ToList();

        var contasPagarDto = contasPagar
            .OrderBy(cp => cp.DataVencimento)
            .Select(cp => new ContaPagarVencendoDto(
                cp.Id,
                cp.FornecedorId,
                fornecedorMap.TryGetValue(cp.FornecedorId, out var fn) ? fn : null,
                cp.Descricao,
                cp.Valor,
                cp.DataVencimento,
                cp.Status.ToString(),
                (cp.DataVencimento.Date - hoje).Days))
            .ToList();

        return Result<ContasVencendoDto>.Ok(new ContasVencendoDto(contasReceberDto, contasPagarDto));
    }

    public async Task<Result<ResumoFinanceiroDto>> ResumoAsync(CancellationToken ct = default)
{
    var hoje   = DateTime.UtcNow.Date;
    var limite = hoje.AddDays(7);

    var todosLancamentos = await lancamentoCaixaRepository.GetAllAsync(ct);
    var saldoAtual = todosLancamentos.Sum(l =>
        l.Tipo == TipoLancamentoCaixa.Entrada ? l.Valor : -l.Valor);

    var contasReceber = await contaReceberRepository.FindAsync(
        cr => (cr.Status == StatusContaReceber.Aberta || cr.Status == StatusContaReceber.Vencida)
              && cr.DataVencimento.Date <= limite, ct);

    var contasPagar = await contaPagarRepository.FindAsync(
        cp => (cp.Status == StatusContaPagar.Aberta || cp.Status == StatusContaPagar.Vencida)
              && cp.DataVencimento.Date <= limite, ct);

    var contasVencidaReceber = await contaReceberRepository.FindAsync(
        cr => cr.Status == StatusContaReceber.Vencida, ct);

    var contasVencidaPagar = await contaPagarRepository.FindAsync(
        cp => cp.Status == StatusContaPagar.Vencida, ct);

    return Result<ResumoFinanceiroDto>.Ok(new ResumoFinanceiroDto(
        Math.Round(saldoAtual, 2),
        Math.Round(contasReceber.Sum(cr => cr.Valor), 2),
        contasReceber.Count,
        Math.Round(contasPagar.Sum(cp => cp.Valor), 2),
        contasPagar.Count,
        Math.Round(contasVencidaReceber.Sum(cr => cr.Valor), 2),
        contasVencidaReceber.Count,
        Math.Round(contasVencidaPagar.Sum(cp => cp.Valor), 2),
        contasVencidaPagar.Count));
}
}
