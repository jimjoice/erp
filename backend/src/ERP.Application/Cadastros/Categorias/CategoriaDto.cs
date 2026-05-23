namespace ERP.Application.Cadastros.Categorias;

public record CreateCategoriaDto(string Nome, string? Descricao = null);

public record UpdateCategoriaDto(string Nome, string? Descricao = null);

public record CategoriaResponseDto(
    Guid Id,
    string Nome,
    string? Descricao,
    DateTime CreatedAt,
    DateTime UpdatedAt);
