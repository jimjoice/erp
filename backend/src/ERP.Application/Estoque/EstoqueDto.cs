using ERP.Application.Cadastros.Produtos;

namespace ERP.Application.Estoque;

public record EntradaMercadoriaDto(
    Guid ProdutoId,
    decimal Quantidade,
    decimal CustoUnitario,
    Guid? FornecedorId,
    string? NumeroNF);

public record SaidaManualDto(
    Guid ProdutoId,
    decimal Quantidade,
    string? Descricao);

public record ItemInventarioDto(
    Guid ProdutoId,
    decimal QuantidadeReal);

public record AjusteInventarioDto(
    IReadOnlyList<ItemInventarioDto> Itens,
    string? Descricao);

public enum SituacaoEstoque { OK = 1, Baixo = 2, Zerado = 3 }

public record PosicaoEstoqueItemDto(
    Guid ProdutoId,
    string Nome,
    string Sku,
    string? CodigoBarras,
    decimal EstoqueAtual,
    decimal EstoqueMinimo,
    string UnidadeMedida,
    SituacaoEstoque Situacao);

public record ResultadoAjusteInventarioDto(
    int TotalItens,
    int ItensAjustados,
    int ItensIgnorados,
    IReadOnlyList<MovimentacaoEstoqueResponseDto> Movimentacoes);
