using ERP.API.Extensions;
using ERP.Application.Vendas;
using ERP.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class VendasEndpoints
{
    public static IEndpointRouteBuilder MapVendas(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/vendas")
            .WithTags("Vendas");

        // Resumo antes do {id:guid} para não colidir
        group.MapGet("/resumo-dia", GetResumoDia)
            .WithName("GetResumoDia")
            .WithSummary("Total vendido hoje, ticket médio e quantidade de vendas confirmadas")
            .RequireAuthorization("Vendedor");

        group.MapGet("/", GetPaginado)
            .WithName("GetVendas")
            .WithSummary("Lista vendas com paginação e filtros")
            .RequireAuthorization("Vendedor");

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetVendaById")
            .WithSummary("Obtém venda por ID com itens e pagamentos")
            .RequireAuthorization("Vendedor");

        group.MapPost("/", CriarOrcamento)
            .WithName("CriarOrcamento")
            .WithSummary("Cria novo orçamento — status inicial: Orcamento")
            .RequireAuthorization("Vendedor");

        group.MapPost("/{id:guid}/itens", AdicionarItem)
            .WithName("AdicionarItemVenda")
            .WithSummary("Adiciona item a um orçamento existente")
            .RequireAuthorization("Vendedor");

        group.MapDelete("/{id:guid}/itens/{itemId:guid}", RemoverItem)
            .WithName("RemoverItemVenda")
            .WithSummary("Remove item de um orçamento")
            .RequireAuthorization("Vendedor");

        group.MapPost("/{id:guid}/finalizar", Finalizar)
            .WithName("FinalizarVenda")
            .WithSummary("Finaliza orçamento: valida estoque, registra pagamentos e gera contas a receber")
            .RequireAuthorization("Vendedor");

        group.MapPost("/{id:guid}/cancelar", Cancelar)
            .WithName("CancelarVenda")
            .WithSummary("Cancela venda (até 24h após confirmação) — estorna estoque e contas a receber abertas")
            .RequireAuthorization("Gerente");

        return app;
    }

    private static async Task<IResult> GetResumoDia(
        IVendaService service,
        CancellationToken ct)
    {
        var result = await service.GetResumoDiaAsync(ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetPaginado(
        [AsParameters] VendaFiltroQuery filtro,
        IVendaService service,
        CancellationToken ct)
    {
        var result = await service.GetPagedAsync(
            filtro.Page, filtro.PageSize,
            filtro.Status, filtro.ClienteId, filtro.FuncionarioId,
            filtro.DataInicio, filtro.DataFim, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IVendaService service,
        CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> CriarOrcamento(
        CriarOrcamentoDto dto,
        IVendaService service,
        IValidator<CriarOrcamentoDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.CriarOrcamentoAsync(dto, user, ct);

        if (!result.Success)
            return result.ToHttpResult();

        return Results.Created($"/api/v1/vendas/{result.Data!.Id}", result.Data);
    }

    private static async Task<IResult> AdicionarItem(
        Guid id,
        AdicionarItemVendaDto dto,
        IVendaService service,
        IValidator<AdicionarItemVendaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.AdicionarItemAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> RemoverItem(
        Guid id,
        Guid itemId,
        IVendaService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.RemoverItemAsync(id, itemId, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Finalizar(
        Guid id,
        FinalizarVendaDto dto,
        IVendaService service,
        IValidator<FinalizarVendaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.FinalizarAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Cancelar(
        Guid id,
        CancelarVendaDto dto,
        IVendaService service,
        IValidator<CancelarVendaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.CancelarAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }
}

public record VendaFiltroQuery(
    [FromQuery] StatusVenda? Status,
    [FromQuery] Guid? ClienteId,
    [FromQuery] Guid? FuncionarioId,
    [FromQuery] DateTime? DataInicio,
    [FromQuery] DateTime? DataFim,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
