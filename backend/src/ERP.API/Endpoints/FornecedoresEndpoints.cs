using ERP.API.Extensions;
using ERP.Application.Cadastros.Fornecedores;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class FornecedoresEndpoints
{
    public static IEndpointRouteBuilder MapFornecedores(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/fornecedores")
            .WithTags("Fornecedores");

        group.MapGet("/", GetPaginado)
            .WithName("GetFornecedores")
            .WithSummary("Lista fornecedores com paginação e filtros")
            .RequireAuthorization("Gerente");

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetFornecedorById")
            .WithSummary("Obtém fornecedor por ID")
            .RequireAuthorization("Gerente");

        group.MapPost("/", Create)
            .WithName("CreateFornecedor")
            .WithSummary("Cria novo fornecedor")
            .RequireAuthorization("Gerente");

        group.MapPut("/{id:guid}", Update)
            .WithName("UpdateFornecedor")
            .WithSummary("Atualiza fornecedor")
            .RequireAuthorization("Gerente");

        group.MapDelete("/{id:guid}", Delete)
            .WithName("DeleteFornecedor")
            .WithSummary("Remove fornecedor (soft delete)")
            .RequireAuthorization("Admin");

        return app;
    }

    private static async Task<IResult> GetPaginado(
        [AsParameters] FornecedorFiltroQuery filtro,
        IFornecedorService service,
        CancellationToken ct)
    {
        var result = await service.GetPagedAsync(filtro.Page, filtro.PageSize, filtro.Search, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IFornecedorService service,
        CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Create(
        CreateFornecedorDto dto,
        IFornecedorService service,
        IValidator<CreateFornecedorDto> validator,
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

        return Results.Created($"/api/v1/fornecedores/{result.Data!.Id}", result.Data);
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateFornecedorDto dto,
        IFornecedorService service,
        IValidator<UpdateFornecedorDto> validator,
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
        IFornecedorService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.DeleteAsync(id, user, ct);
        return result.ToHttpResult();
    }
}

public record FornecedorFiltroQuery(
    [FromQuery] string? Search,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
