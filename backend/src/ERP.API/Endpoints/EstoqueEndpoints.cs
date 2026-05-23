using ERP.API.Extensions;
using ERP.Application.Estoque;
using ERP.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class EstoqueEndpoints
{
    public static IEndpointRouteBuilder MapEstoque(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/estoque")
            .WithTags("Estoque");

        group.MapGet("/", GetPosicao)
            .WithName("GetPosicaoEstoque")
            .WithSummary("Posição atual do estoque de todos os produtos")
            .RequireAuthorization("Vendedor");

        group.MapGet("/alertas", GetAlertas)
            .WithName("GetAlertasEstoque")
            .WithSummary("Produtos com estoque zerado ou abaixo do mínimo")
            .RequireAuthorization("Vendedor");

        group.MapGet("/movimentacoes", GetMovimentacoes)
            .WithName("GetMovimentacoesEstoque")
            .WithSummary("Lista paginada de movimentações com filtros opcionais")
            .RequireAuthorization("Vendedor");

        group.MapPost("/entrada", PostEntrada)
            .WithName("EntradaMercadoria")
            .WithSummary("Registra entrada de mercadoria no estoque")
            .RequireAuthorization("Gerente");

        group.MapPost("/saida", PostSaida)
            .WithName("SaidaManual")
            .WithSummary("Registra saída manual de estoque")
            .RequireAuthorization("Gerente");

        group.MapPost("/inventario", PostInventario)
            .WithName("AjusteInventario")
            .WithSummary("Ajusta estoque por contagem física (inventário periódico)")
            .RequireAuthorization("Gerente");

        return app;
    }

    private static async Task<IResult> GetPosicao(
        IEstoqueService service,
        CancellationToken ct)
    {
        var result = await service.ObterPosicaoEstoqueAsync(ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetAlertas(
        IEstoqueService service,
        CancellationToken ct)
    {
        var result = await service.ObterAlertasEstoqueMinimoAsync(ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetMovimentacoes(
        [AsParameters] MovimentacaoFiltroQuery filtro,
        IEstoqueService service,
        CancellationToken ct)
    {
        var result = await service.GetMovimentacoesAsync(
            filtro.Page, filtro.PageSize,
            filtro.ProdutoId, filtro.Tipo,
            filtro.DataInicio, filtro.DataFim,
            ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> PostEntrada(
        EntradaMercadoriaDto dto,
        IEstoqueService service,
        IValidator<EntradaMercadoriaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.EntradaMercadoriaAsync(dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> PostSaida(
        SaidaManualDto dto,
        IEstoqueService service,
        IValidator<SaidaManualDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.SaidaManualAsync(dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> PostInventario(
        AjusteInventarioDto dto,
        IEstoqueService service,
        IValidator<AjusteInventarioDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.AjusteInventarioAsync(dto, user, ct);
        return result.ToHttpResult();
    }
}

public record MovimentacaoFiltroQuery(
    [FromQuery] Guid? ProdutoId,
    [FromQuery] TipoMovimentacaoEstoque? Tipo,
    [FromQuery] DateTime? DataInicio,
    [FromQuery] DateTime? DataFim,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
