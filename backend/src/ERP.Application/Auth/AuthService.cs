using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ERP.Application.Auth;

public class AuthService(IUsuarioRepository usuarioRepo, IConfiguration configuration) : IAuthService
{
    private readonly string _jwtSecret = configuration["JWT_SECRET"]
        ?? throw new InvalidOperationException("JWT_SECRET não configurado.");

    private readonly int _accessExpiresSeconds = int.TryParse(
        configuration["JWT_EXPIRES_SECONDS"], out var sec) ? sec : 3600;

    // Refresh token válido por 7 dias
    private const int RefreshExpiresSeconds = 7 * 24 * 3600;

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var usuario = await usuarioRepo.GetByEmailAsync(request.Email.Trim().ToLower(), ct);

        if (usuario is null || !usuario.Ativo)
            return Result<LoginResponseDto>.Unauthorized("Credenciais inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Result<LoginResponseDto>.Unauthorized("Credenciais inválidas.");

        var claims = BuildClaims(usuario.Id, usuario.Email, usuario.Nome, usuario.Perfil.ToString());

        return Result<LoginResponseDto>.Ok(new LoginResponseDto(
            AccessToken:  GerarToken(claims, _accessExpiresSeconds),
            RefreshToken: GerarToken(claims, RefreshExpiresSeconds),
            ExpiresIn:    _accessExpiresSeconds,
            Usuario: new UsuarioInfoDto(
                Id:     usuario.Id,
                Nome:   usuario.Nome,
                Email:  usuario.Email,
                Perfil: usuario.Perfil.ToString())));
    }

    public Task<Result<LoginResponseDto>> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        try
        {
            var principal = ValidarToken(refreshToken, validateLifetime: true);
            if (principal is null)
                return Task.FromResult(Result<LoginResponseDto>.Unauthorized("Refresh token inválido ou expirado."));

            var sub   = principal.FindFirst(JwtRegisteredClaimNames.Sub)!.Value;
            var email = principal.FindFirst(JwtRegisteredClaimNames.Email)!.Value;
            var nome  = principal.FindFirst("nome")!.Value;
            var role  = principal.FindFirst(ClaimTypes.Role)!.Value;

            var claims = BuildClaims(Guid.Parse(sub), email, nome, role);

            return Task.FromResult(Result<LoginResponseDto>.Ok(new LoginResponseDto(
                AccessToken:  GerarToken(claims, _accessExpiresSeconds),
                RefreshToken: GerarToken(claims, RefreshExpiresSeconds),
                ExpiresIn:    _accessExpiresSeconds,
                Usuario: new UsuarioInfoDto(
                    Id:     Guid.Parse(sub),
                    Nome:   nome,
                    Email:  email,
                    Perfil: role))));
        }
        catch
        {
            return Task.FromResult(
                Result<LoginResponseDto>.Unauthorized("Refresh token inválido ou expirado."));
        }
    }

    private static Claim[] BuildClaims(Guid id, string email, string nome, string perfil) =>
    [
        new(JwtRegisteredClaimNames.Sub,   id.ToString()),
        new(JwtRegisteredClaimNames.Email, email),
        new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        new("nome",                        nome),
        new(ClaimTypes.Role,               perfil)
    ];

    private string GerarToken(Claim[] claims, int expiresSeconds)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims:             claims,
            expires:            DateTime.UtcNow.AddSeconds(expiresSeconds),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidarToken(string token, bool validateLifetime)
    {
        var handler = new JwtSecurityTokenHandler();
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));

        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = false,
                ValidateAudience         = false,
                ValidateLifetime         = validateLifetime,
                ClockSkew                = TimeSpan.Zero
            }, out _);
        }
        catch
        {
            return null;
        }
    }
}
