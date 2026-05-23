using ERP.Application.Common;

namespace ERP.Application.Cadastros.Categorias;

public interface ICategoriaService
{
    Task<Result<CategoriaResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<CategoriaResponseDto>>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<Result<CategoriaResponseDto>> CreateAsync(CreateCategoriaDto dto, string criadoPor, CancellationToken ct = default);
    Task<Result<CategoriaResponseDto>> UpdateAsync(Guid id, UpdateCategoriaDto dto, string atualizadoPor, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default);
}
