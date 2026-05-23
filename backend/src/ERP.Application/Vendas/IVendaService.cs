using ERP.Application.Common;
using ERP.Domain.Enums;

namespace ERP.Application.Vendas;

public interface IVendaService
{
    Task<Result<VendaResponseDto>> CriarOrcamentoAsync(
        CriarOrcamentoDto dto, string criadoPor, CancellationToken ct = default);

    Task<Result<VendaResponseDto>> AdicionarItemAsync(
        Guid vendaId, AdicionarItemVendaDto dto, string atualizadoPor, CancellationToken ct = default);

    Task<Result<VendaResponseDto>> RemoverItemAsync(
        Guid vendaId, Guid itemId, string atualizadoPor, CancellationToken ct = default);

    Task<Result<VendaResponseDto>> AplicarDescontoAsync(
        Guid vendaId, AplicarDescontoDto dto, string atualizadoPor, CancellationToken ct = default);

    Task<Result<VendaResponseDto>> FinalizarAsync(
        Guid vendaId, FinalizarVendaDto dto, string finalizadoPor, CancellationToken ct = default);

    Task<Result> CancelarAsync(
        Guid vendaId, CancelarVendaDto dto, string canceladoPor, CancellationToken ct = default);

    Task<Result<VendaResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<Result<PagedResult<VendaResponseDto>>> GetPagedAsync(
        int page, int pageSize,
        StatusVenda? status = null,
        Guid? clienteId = null,
        Guid? funcionarioId = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default);

    Task<Result<ResumoDiaDto>> GetResumoDiaAsync(CancellationToken ct = default);
}
