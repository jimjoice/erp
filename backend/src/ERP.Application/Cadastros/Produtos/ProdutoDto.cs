using ERP.Domain.Enums;

namespace ERP.Application.Cadastros.Produtos;

public record CreateProdutoDto(
    string Nome,
    string Sku,
    string? CodigoBarras,
    string? Ncm,
    string? Descricao,
    decimal PrecoCusto,
    decimal PrecoVenda,
    decimal EstoqueMinimo,
    UnidadeMedida UnidadeMedida,
    Guid CategoriaId);

public record UpdateProdutoDto(
    string Nome,
    string? CodigoBarras,
    string? Ncm,
    string? Descricao,
    decimal PrecoCusto,
    decimal PrecoVenda,
    decimal EstoqueMinimo,
    UnidadeMedida UnidadeMedida,
    Guid CategoriaId);

public record ProdutoResponseDto(
    Guid Id,
    string Nome,
    string Sku,
    string? CodigoBarras,
    string? Ncm,
    string? Descricao,
    decimal PrecoCusto,
    decimal PrecoVenda,
    decimal EstoqueAtual,
    decimal EstoqueMinimo,
    bool EstoqueAbaixoDoMinimo,
    string UnidadeMedida,
    Guid CategoriaId,
    string? CategoriaNome,
    DateTime CreatedAt,
    DateTime UpdatedAt);
