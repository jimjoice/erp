namespace ERP.Application.Auth;

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresIn,
    UsuarioInfoDto Usuario);

public record UsuarioInfoDto(
    Guid   Id,
    string Nome,
    string Email,
    string Perfil);
