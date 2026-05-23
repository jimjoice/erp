using ERP.Application.Common;

namespace ERP.Application.Cadastros.Funcionarios;

public interface IFuncionarioService
{
    Task<Result<FuncionarioResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<FuncionarioResponseDto>>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<Result<FuncionarioResponseDto>> CreateAsync(CreateFuncionarioDto dto, string criadoPor, CancellationToken ct = default);
    Task<Result<FuncionarioResponseDto>> UpdateAsync(Guid id, UpdateFuncionarioDto dto, string atualizadoPor, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default);
}
