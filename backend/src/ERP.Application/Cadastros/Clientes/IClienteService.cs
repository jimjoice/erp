using ERP.Application.Common;

namespace ERP.Application.Cadastros.Clientes;

public interface IClienteService
{
    Task<Result<ClienteResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<PagedResult<ClienteResponseDto>>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken ct = default);
    Task<Result<ClienteResponseDto>> CreateAsync(CreateClienteDto dto, string criadoPor, CancellationToken ct = default);
    Task<Result<ClienteResponseDto>> UpdateAsync(Guid id, UpdateClienteDto dto, string atualizadoPor, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default);
    Task<Result<ClienteResponseDto>> GetByCpfCnpjAsync(string cpfCnpj, CancellationToken ct = default);
}
