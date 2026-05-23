using ERP.API.Extensions;
using ERP.Application.Cadastros.Produtos;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Endpoints;

public static class ProdutosEndpoints
{
    public static IEndpointRouteBuilder MapProdutos(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/produtos")
            .WithTags("Produtos");

        group.MapGet("/", GetPaginado)
            .WithName("GetProdutos")
            .WithSummary("Lista produtos com paginação e filtros")
            .RequireAuthorization("Vendedor");

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetProdutoById")
            .WithSummary("Obtém produto por ID")
            .RequireAuthorization("Vendedor");

        group.MapPost("/", Create)
            .WithName("CreateProduto")
            .WithSummary("Cria novo produto")
            .RequireAuthorization("Gerente");

        group.MapPut("/{id:guid}", Update)
            .WithName("UpdateProduto")
            .WithSummary("Atualiza produto")
            .RequireAuthorization("Gerente");

        group.MapDelete("/{id:guid}", Delete)
            .WithName("DeleteProduto")
            .WithSummary("Remove produto (soft delete)")
            .RequireAuthorization("Admin");

        group.MapGet("/{id:guid}/movimentacoes", GetMovimentacoes)
            .WithName("GetProdutoMovimentacoes")
            .WithSummary("Lista movimentações de estoque do produto")
            .RequireAuthorization("Vendedor");

        return app;
    }

    private static async Task<IResult> GetPaginado(
        [AsParameters] ProdutoFiltroQuery filtro,
        IProdutoService service,
        CancellationToken ct)
    {
        var result = await service.GetPagedAsync(
            filtro.Page, filtro.PageSize,
            filtro.Search, filtro.CategoriaId, filtro.SomenteAbaixoDoMinimo, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IProdutoService service,
        CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> Create(
        CreateProdutoDto dto,
        IProdutoService service,
        IValidator<CreateProdutoDto> validator,
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

        return Results.Created($"/api/v1/produtos/{result.Data!.Id}", result.Data);
    }

    private static async Task<IResult> Update(
        Guid id,
        UpdateProdutoDto dto,
        IProdutoService service,
        IValidator<UpdateProdutoDto> validator,
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
        IProdutoService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var user = httpContext.User.FindFirst("sub")?.Value ?? "sistema";
        var result = await service.DeleteAsync(id, user, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> GetMovimentacoes(
        Guid id,
        [AsParameters] PaginacaoQuery paginacao,
        IProdutoService service,
        CancellationToken ct)
    {
        var result = await service.GetMovimentacoesAsync(id, paginacao.Page, paginacao.PageSize, ct);
        return result.ToHttpResult();
    }
}

public record ProdutoFiltroQuery(
    [FromQuery] string? Search,
    [FromQuery] Guid? CategoriaId,
    [FromQuery] bool? SomenteAbaixoDoMinimo,
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);

public record PaginacaoQuery(
    [FromQuery] int Page = 1,
    [FromQuery] int PageSize = 20);
