using ERP.API.Extensions;
using ERP.Application.Financeiro;
using ERP.Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class FinanceiroEndpoints
{
    public static IEndpointRouteBuilder MapFinanceiro(this IEndpointRouteBuilder app)
    {
        MapContasReceber(app);
        MapContasPagar(app);
        MapPainelFinanceiro(app);
        return app;
    }

    // ── /api/v1/contas-receber ────────────────────────────────────────────────

    private static void MapContasReceber(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/contas-receber")
            .WithTags("Contas a Receber");

        group.MapGet("/", GetContasReceber)
            .WithName("GetContasReceber")
            .WithSummary("Lista contas a receber paginadas, filtráveis por status, data de vencimento e cliente")
            .RequireAuthorization("Financeiro");

        group.MapPost("/{id:guid}/baixar", BaixarContaReceber)
            .WithName("BaixarContaReceber")
            .WithSummary("Registra pagamento de uma conta a receber e lança entrada no caixa")
            .RequireAuthorization("Financeiro");
    }

    // ── /api/v1/contas-pagar ──────────────────────────────────────────────────

    private static void MapContasPagar(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/contas-pagar")
            .WithTags("Contas a Pagar");

        group.MapGet("/", GetContasPagar)
            .WithName("GetContasPagar")
            .WithSummary("Lista contas a pagar paginadas, filtráveis por status, data de vencimento e fornecedor")
            .RequireAuthorization("Financeiro");

        group.MapPost("/{id:guid}/baixar", BaixarContaPagar)
            .WithName("BaixarContaPagar")
            .WithSummary("Registra pagamento de uma conta a pagar e lança saída no caixa")
            .RequireAuthorization("Financeiro");
    }

    // ── /api/v1/financeiro ────────────────────────────────────────────────────

    private static void MapPainelFinanceiro(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/financeiro")
            .WithTags("Financeiro");

        group.MapGet("/fluxo-caixa", GetFluxoCaixa)
            .WithName("GetFluxoCaixa")
            .WithSummary("Fluxo de caixa do período: saldo inicial, entradas, saídas e saldo final")
            .RequireAuthorization("Financeiro");

        group.MapGet("/resumo", GetResumo)
            .WithName("GetResumoFinanceiro")
            .WithSummary("Saldo atual do caixa, total a receber e a pagar nos próximos 7 dias")
            .RequireAuthorization("Financeiro");
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    private static async Task<IResult> GetContasReceber(
        [AsParameters] ContaReceberFiltroQuery filtro,
        IFinanceiroService service,
        CancellationToken ct)
    {
        var result = await service.GetContasReceberAsync(
            filtro.Page, filtro.PageSize,
            filtro.Status, filtro.ClienteId,
            filtro.DataInicio, filtro.DataFim, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> BaixarContaReceber(
        Guid id,
        BaixarContaDto dto,
        IFinanceiroService service,
        IValidator<BaixarContaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.BaixarContaReceberAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetContasPagar(
        [AsParameters] ContaPagarFiltroQuery filtro,
        IFinanceiroService service,
        CancellationToken ct)
    {
        var result = await service.GetContasPagarAsync(
            filtro.Page, filtro.PageSize,
            filtro.Status, filtro.FornecedorId,
            filtro.DataInicio, filtro.DataFim, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> BaixarContaPagar(
        Guid id,
        BaixarContaDto dto,
        IFinanceiroService service,
        IValidator<BaixarContaDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.BaixarContaPagarAsync(id, dto, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetFluxoCaixa(
        [FromQuery] DateTime inicio,
        [FromQuery] DateTime fim,
        IFinanceiroService service,
        CancellationToken ct)
    {
        if (fim.Date < inicio.Date)
            return Results.Problem(
                detail: "A data fim deve ser maior ou igual à data início.",
                statusCode: 400,
                title: "Requisição inválida");

        var result = await service.FluxoCaixaAsync(inicio, fim, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetResumo(
        IFinanceiroService service,
        CancellationToken ct)
    {
        var result = await service.ResumoAsync(ct);
        return result.ToHttpResult();
    }
}

// ── Query records ─────────────────────────────────────────────────────────────

public record ContaReceberFiltroQuery(
    [FromQuery] StatusContaReceber? Status,
    [FromQuery] Guid? ClienteId,
    [FromQuery] DateTime? DataInicio,
    [FromQuery] DateTime? DataFim,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);

public record ContaPagarFiltroQuery(
    [FromQuery] StatusContaPagar? Status,
    [FromQuery] Guid? FornecedorId,
    [FromQuery] DateTime? DataInicio,
    [FromQuery] DateTime? DataFim,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
