using ERP.Application.Common;

namespace ERP.Application.Cadastros.Produtos;

public interface IProdutoService
{
    Task<Result<ProdutoResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<ProdutoResponseDto>>> GetPagedAsync(int page, int pageSize, string? search = null, Guid? categoriaId = null, bool? somenteAbaixoDoMinimo = null, CancellationToken ct = default);
    Task<Result<ProdutoResponseDto>> CreateAsync(CreateProdutoDto dto, string criadoPor, CancellationToken ct = default);
    Task<Result<ProdutoResponseDto>> UpdateAsync(Guid id, UpdateProdutoDto dto, string atualizadoPor, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default);
    Task<Result<PagedResult<MovimentacaoEstoqueResponseDto>>> GetMovimentacoesAsync(Guid produtoId, int page, int pageSize, CancellationToken ct = default);
}
