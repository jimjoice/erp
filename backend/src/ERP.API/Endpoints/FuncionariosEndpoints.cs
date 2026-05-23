using ERP.API.Extensions;
using ERP.Application.Cadastros.Funcionarios;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class FuncionariosEndpoints
{
    public static IEndpointRouteBuilder MapFuncionarios(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/funcionarios")
            .WithTags("Funcionários");

        group.MapGet("/", GetPaginado)
            .WithName("GetFuncionarios")
            .WithSummary("Lista funcionários com paginação e filtro por nome")
            .RequireAuthorization("Gerente");

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetFuncionarioById")
            .WithSummary("Obtém funcionário por ID")
            .RequireAuthorization("Gerente");

        group.MapPost("/", Create)
            .WithName("CreateFuncionario")
            .WithSummary("Cadastra novo funcionário")
            .RequireAuthorization("Admin");

        group.MapPut("/{id:guid}", Update)
            .WithName("UpdateFuncionario")
            .WithSummary("Atualiza cargo e salário do funcionário")
            .RequireAuthorization("Admin");

        group.MapDelete("/{id:guid}", Delete)
            .WithName("DeleteFuncionario")
            .WithSummary("Remove funcionário (soft delete)")
            .RequireAuthorization("Admin");

        return app;
    }

    private static async Task<IResult> GetPaginado(
        [AsParameters] FuncionarioFiltroQuery filtro,
        IFuncionarioService service,
        CancellationToken ct)
    {
        var result = await service.GetPagedAsync(filtro.Page, filtro.PageSize, filtro.Search, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IFuncionarioService service,
        CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Create(
        CreateFuncionarioDto dto,
        IFuncionarioService service,
        IValidator<CreateFuncionarioDto> validator,
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

        return Results.Created($"/api/v1/funcionarios/{result.Data!.Id}", result.Data);
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateFuncionarioDto dto,
        IFuncionarioService service,
        IValidator<UpdateFuncionarioDto> validator,
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
        IFuncionarioService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.DeleteAsync(id, user, ct);
        return result.ToHttpResult();
    }
}

public record FuncionarioFiltroQuery(
    [FromQuery] string? Search,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
