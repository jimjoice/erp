namespace ERP.Application.Financeiro;

// ── Input ─────────────────────────────────────────────────────────────────────

public record BaixarContaDto(DateTime DataPagamento, decimal ValorPago);

// ── Response ──────────────────────────────────────────────────────────────────

public record ContaPagarResponseDto(
    Guid Id,
    Guid FornecedorId,
    string? FornecedorRazaoSocial,
    string Descricao,
    decimal Valor,
    DateTime DataVencimento,
    DateTime? DataPagamento,
    string Status,
    DateTime CreatedAt);

public record LancamentoCaixaResponseDto(
    Guid Id,
    string Tipo,
    decimal Valor,
    string Descricao,
    Guid? ContaReceberId,
    Guid? ContaPagarId,
    DateTime CreatedAt);

public record FluxoCaixaDto(
    DateTime DataInicio,
    DateTime DataFim,
    decimal SaldoInicial,
    decimal Entradas,
    decimal Saidas,
    decimal SaldoFinal,
    IReadOnlyList<LancamentoCaixaResponseDto> Lancamentos);

public record ContaReceberVencendoDto(
    Guid Id,
    Guid? VendaId,
    Guid? ClienteId,
    string? ClienteNome,
    string Descricao,
    decimal Valor,
    DateTime DataVencimento,
    string Status,
    int DiasAteVencimento);

public record ContaPagarVencendoDto(
    Guid Id,
    Guid FornecedorId,
    string? FornecedorRazaoSocial,
    string Descricao,
    decimal Valor,
    DateTime DataVencimento,
    string Status,
    int DiasAteVencimento);

public record ContasVencendoDto(
    IReadOnlyList<ContaReceberVencendoDto> ContasReceber,
    IReadOnlyList<ContaPagarVencendoDto> ContasPagar);

public record ResumoFinanceiroDto(
    decimal SaldoAtual,
    decimal TotalReceberProximos7Dias,
    int QuantidadeReceberProximos7Dias,
    decimal TotalPagarProximos7Dias,
    int QuantidadePagarProximos7Dias);
