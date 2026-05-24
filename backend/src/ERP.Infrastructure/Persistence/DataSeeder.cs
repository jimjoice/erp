using BCrypt.Net;
using ERP.Domain.Entities;
using ERP.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context, ILogger? logger = null)
    {
        if (await context.Usuarios.AnyAsync())
        {
            logger?.LogInformation("Banco já possui dados — seed ignorado.");
            return;
        }

        logger?.LogInformation("Iniciando seed dos dados iniciais...");

        await SeedUsuariosAsync(context);
        await SeedCategoriasAsync(context);

        await context.SaveChangesAsync();
        logger?.LogInformation("Seed concluído com sucesso.");
    }

    private static Task SeedUsuariosAsync(AppDbContext context)
    {
        var adminHash   = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var vendedorHash = BCrypt.Net.BCrypt.HashPassword("Vendedor@123");

        var admin = Usuario.Create(
            nome:      "Administrador",
            email:     "admin@erp.local",
            senhaHash: adminHash,
            perfil:    PerfilUsuario.Admin,
            criadoPor: "seed");

        var vendedor = Usuario.Create(
            nome:      "Vendedor Exemplo",
            email:     "vendedor@erp.local",
            senhaHash: vendedorHash,
            perfil:    PerfilUsuario.Vendedor,
            criadoPor: "seed");

        context.Usuarios.AddRange(admin, vendedor);
        return Task.CompletedTask;
    }

    private static Task SeedCategoriasAsync(AppDbContext context)
    {
        var categorias = new[]
        {
            Categoria.Create("Geral",    "Categoria geral para produtos sem classificação específica", "seed"),
            Categoria.Create("Alimentos","Produtos alimentícios em geral", "seed"),
            Categoria.Create("Bebidas",  "Bebidas alcoólicas e não alcoólicas", "seed"),
            Categoria.Create("Limpeza",  "Produtos de limpeza doméstica e comercial", "seed"),
            Categoria.Create("Higiene",  "Produtos de higiene pessoal", "seed"),
        };

        context.Categorias.AddRange(categorias);
        return Task.CompletedTask;
    }
}
