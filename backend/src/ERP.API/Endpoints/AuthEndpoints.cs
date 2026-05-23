using ERP.API.Extensions;
using ERP.Application.Auth;
using ERP.Domain.Entities;
using ERP.Domain.Enums;
using ERP.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth")
            .WithTags("Auth")
            .AllowAnonymous();

        group.MapPost("/login", Login)
            .WithName("Login")
            .WithSummary("Autentica usuário e retorna access e refresh tokens");

        group.MapPost("/refresh", Refresh)
            .WithName("RefreshToken")
            .WithSummary("Renova o access token usando o refresh token");

        group.MapPost("/seed-admin", SeedAdmin)
            .WithName("SeedAdmin")
            .WithSummary("[DEV ONLY] Cria o usuário admin e retorna o hash gerado");

        return app;
    }

    private static async Task<IResult> Login(
        LoginRequestDto dto,
        IAuthService service,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["email"] = ["O campo email é obrigatório."],
                ["senha"] = ["O campo senha é obrigatório."]
            });

        var result = await service.LoginAsync(dto, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Refresh(
        RefreshRequestDto dto,
        IAuthService service,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["refreshToken"] = ["O campo refreshToken é obrigatório."]
            });

        var result = await service.RefreshTokenAsync(dto.RefreshToken, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> SeedAdmin(
        IWebHostEnvironment env,
        AppDbContext db,
        CancellationToken ct)
    {
        if (!env.IsDevelopment())
            return Results.NotFound();

        const string email = "admin@erp.local";
        const string senha = "Admin@123";

        var existe = await db.Usuarios.AnyAsync(u => u.Email == email, ct);
        if (existe)
            return Results.Conflict(new { mensagem = "Usuário admin já existe.", email });

        var hash = BCrypt.Net.BCrypt.HashPassword(senha);
        var admin = Usuario.Create("Administrador", email, hash, PerfilUsuario.Admin, "seed");
        db.Usuarios.Add(admin);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new { email, senhaHash = hash });
    }
}

public record RefreshRequestDto(string RefreshToken);
