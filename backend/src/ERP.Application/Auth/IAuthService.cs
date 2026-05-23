using ERP.Application.Common;

namespace ERP.Application.Auth;

public interface IAuthService
{
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<Result<LoginResponseDto>> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
}
