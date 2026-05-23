using ERP.Application.Common;

namespace ERP.Application.Cadastros.Fornecedores;

public interface IFornecedorService
{
    Task<Result<FornecedorResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<FornecedorResponseDto>>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<Result<FornecedorResponseDto>> CreateAsync(CreateFornecedorDto dto, string criadoPor, CancellationToken ct = default);
    Task<Result<FornecedorResponseDto>> UpdateAsync(Guid id, UpdateFornecedorDto dto, string atualizadoPor, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default);
}
