using ERP.Application.Cadastros.Produtos;
using ERP.Application.Common;
using ERP.Domain.Enums;

namespace ERP.Application.Estoque;

public interface IEstoqueService
{
    Task<Result<MovimentacaoEstoqueResponseDto>> EntradaMercadoriaAsync(
        EntradaMercadoriaDto dto, string criadoPor, CancellationToken ct = default);

    Task<Result<MovimentacaoEstoqueResponseDto>> SaidaManualAsync(
        SaidaManualDto dto, string criadoPor, CancellationToken ct = default);

    Task<Result<ResultadoAjusteInventarioDto>> AjusteInventarioAsync(
        AjusteInventarioDto dto, string criadoPor, CancellationToken ct = default);

    Task<Result<IReadOnlyList<PosicaoEstoqueItemDto>>> ObterPosicaoEstoqueAsync(
        CancellationToken ct = default);

    Task<Result<IReadOnlyList<PosicaoEstoqueItemDto>>> ObterAlertasEstoqueMinimoAsync(
        CancellationToken ct = default);

    Task<Result<PagedResult<MovimentacaoEstoqueResponseDto>>> GetMovimentacoesAsync(
        int page, int pageSize,
        Guid? produtoId = null,
        TipoMovimentacaoEstoque? tipo = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default);
}
