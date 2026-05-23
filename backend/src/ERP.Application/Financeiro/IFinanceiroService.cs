using ERP.Application.Common;
using ERP.Application.Vendas;
using ERP.Domain.Enums;

namespace ERP.Application.Financeiro;

public interface IFinanceiroService
{
    Task<Result<PagedResult<ContaReceberResponseDto>>> GetContasReceberAsync(
        int page, int pageSize,
        StatusContaReceber? status, Guid? clienteId,
        DateTime? dataInicio, DateTime? dataFim,
        CancellationToken ct = default);

    Task<Result<PagedResult<ContaPagarResponseDto>>> GetContasPagarAsync(
        int page, int pageSize,
        StatusContaPagar? status, Guid? fornecedorId,
        DateTime? dataInicio, DateTime? dataFim,
        CancellationToken ct = default);

    Task<Result<ContaReceberResponseDto>> BaixarContaReceberAsync(
        Guid id, BaixarContaDto dto, string usuario, CancellationToken ct = default);

    Task<Result<ContaPagarResponseDto>> BaixarContaPagarAsync(
        Guid id, BaixarContaDto dto, string usuario, CancellationToken ct = default);

    Task<Result<FluxoCaixaDto>> FluxoCaixaAsync(
        DateTime dataInicio, DateTime dataFim, CancellationToken ct = default);

    Task<Result<ContasVencendoDto>> ContasVencendoAsync(
        int dias = 7, CancellationToken ct = default);

    Task<Result<ResumoFinanceiroDto>> ResumoAsync(CancellationToken ct = default);
}
