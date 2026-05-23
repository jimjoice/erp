using ERP.Domain.Enums;

namespace ERP.Application.Vendas;

// ── Input DTOs ────────────────────────────────────────────────────────────────

public record CriarOrcamentoDto(
    Guid? ClienteId,
    Guid FuncionarioId,
    string? Observacao,
    IReadOnlyList<ItemOrcamentoDto> Itens);

public record ItemOrcamentoDto(
    Guid ProdutoId,
    decimal Quantidade,
    decimal? PrecoUnitario = null,
    decimal Desconto = 0);

public record AdicionarItemVendaDto(
    Guid ProdutoId,
    decimal Quantidade,
    decimal? PrecoUnitario = null,
    decimal Desconto = 0);

public record AplicarDescontoDto(decimal Percentual);

public record FinalizarVendaDto(IReadOnlyList<PagamentoInputDto> Pagamentos);

public record PagamentoInputDto(
    FormaPagamento Forma,
    decimal Valor,
    int Parcelas = 1,
    decimal TaxaJuros = 0);

public record CancelarVendaDto(string Motivo);

// ── Response DTOs ─────────────────────────────────────────────────────────────

public record VendaResponseDto(
    Guid Id,
    int Numero,
    Guid? ClienteId,
    string? ClienteNome,
    Guid FuncionarioId,
    string? FuncionarioNome,
    string Status,
    DateTime DataVenda,
    decimal Subtotal,
    decimal Desconto,
    decimal Total,
    string? Observacao,
    IReadOnlyList<ItemVendaResponseDto> Itens,
    IReadOnlyList<PagamentoResponseDto> Pagamentos,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ItemVendaResponseDto(
    Guid Id,
    Guid ProdutoId,
    string? ProdutoNome,
    decimal Quantidade,
    decimal PrecoUnitario,
    decimal Desconto,
    decimal Subtotal);

public record PagamentoResponseDto(
    Guid Id,
    string Forma,
    decimal Valor,
    int Parcelas,
    decimal TaxaJuros);

public record ResumoDiaDto(
    DateTime Data,
    int QuantidadeVendas,
    decimal TotalVendido,
    decimal TicketMedio);

public record ContaReceberResponseDto(
    Guid Id,
    Guid? VendaId,
    Guid? ClienteId,
    string FormaPagamento,
    string Descricao,
    decimal Valor,
    int NumeroParcela,
    int TotalParcelas,
    DateTime DataVencimento,
    DateTime? DataPagamento,
    string Status,
    DateTime CreatedAt);
