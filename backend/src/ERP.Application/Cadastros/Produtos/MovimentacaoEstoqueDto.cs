namespace ERP.Application.Cadastros.Produtos;

public record MovimentacaoEstoqueResponseDto(
    Guid Id,
    Guid ProdutoId,
    string? ProdutoNome,
    string Tipo,
    decimal Quantidade,
    decimal QuantidadeAnterior,
    decimal QuantidadeResultante,
    string MotivoCodigo,
    string? Descricao,
    string? DocumentoOrigem,
    DateTime CreatedAt,
    string CreatedBy);
