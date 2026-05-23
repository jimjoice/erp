namespace ERP.Domain.Enums;

public enum MotivoMovimentacaoEstoque
{
    // Entrada (1–9)
    CompraFornecedor    = 1,
    DevolucaoCliente    = 2,
    EntradaManual       = 3,

    // Saída (10–19)
    VendaPdv            = 10,
    DevolucaoFornecedor = 11,
    PerdaAvaria         = 12,
    SaidaManual         = 13,

    // Ajuste (20–29)
    AjustePositivo      = 20,
    AjusteNegativo      = 21,

    // Inventário (30–39)
    InventarioPeriodico = 30,
}
