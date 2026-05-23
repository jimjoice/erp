using ERP.API.Extensions;
using ERP.Application.Cadastros.Clientes;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class ClientesEndpoints
{
    public static IEndpointRouteBuilder MapClientes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/clientes")
            .WithTags("Clientes");

        // buscar ANTES de {id:guid} — evita ambiguidade de rota
        group.MapGet("/buscar", BuscarPorCpfCnpj)
            .WithName("BuscarClientePorCpfCnpj")
            .WithSummary("Busca cliente por CPF ou CNPJ")
            .RequireAuthorization("Vendedor");

        group.MapGet("/", GetPaginado)
            .WithName("GetClientes")
            .WithSummary("Lista clientes com paginação e filtros")
            .RequireAuthorization("Vendedor");

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetClienteById")
            .WithSummary("Obtém cliente por ID")
            .RequireAuthorization("Vendedor");

        group.MapPost("/", Create)
            .WithName("CreateCliente")
            .WithSummary("Cria novo cliente")
            .RequireAuthorization("Gerente");

        group.MapPut("/{id:guid}", Update)
            .WithName("UpdateCliente")
            .WithSummary("Atualiza cliente")
            .RequireAuthorization("Gerente");

        group.MapDelete("/{id:guid}", Delete)
            .WithName("DeleteCliente")
            .WithSummary("Remove cliente (soft delete)")
            .RequireAuthorization("Admin");

        return app;
    }

    private static async Task<IResult> BuscarPorCpfCnpj(
        [FromQuery] string cpfCnpj,
        IClienteService service,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cpfCnpj))
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["cpfCnpj"] = ["O parâmetro cpfCnpj é obrigatório."]
            });

        var result = await service.GetByCpfCnpjAsync(cpfCnpj, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetPaginado(
        [AsParameters] ClienteFiltroQuery filtro,
        IClienteService service,
        CancellationToken ct)
    {
        var result = await service.GetPagedAsync(filtro.Page, filtro.PageSize, filtro.Search, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IClienteService service,
        CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Create(
        CreateClienteDto dto,
        IClienteService service,
        IValidator<CreateClienteDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.CreateAsync(dto, user, ct);

        if (!result.Success)
            return result.ToHttpResult();

        return Results.Created($"/api/v1/clientes/{result.Data!.Id}", result.Data);
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateClienteDto dto,
        IClienteService service,
        IValidator<UpdateClienteDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.UpdateAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Delete(
        Guid id,
        IClienteService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.DeleteAsync(id, user, ct);
        return result.ToHttpResult();
    }
}

public record ClienteFiltroQuery(
    [FromQuery] string? Search,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
