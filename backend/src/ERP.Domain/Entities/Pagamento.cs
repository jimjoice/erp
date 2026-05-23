using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class Pagamento : BaseEntity
{
    public Guid VendaId { get; private set; }
    public FormaPagamento Forma { get; private set; }
    public decimal Valor { get; private set; }
    public int Parcelas { get; private set; }
    public decimal TaxaJuros { get; private set; }

    public Venda? Venda { get; private set; }

    private Pagamento() { }

    internal static Pagamento Create(
        Guid vendaId,
        FormaPagamento forma,
        decimal valor,
        int parcelas,
        decimal taxaJuros,
        string criadoPor)
    {
        var pagamento = new Pagamento
        {
            VendaId    = vendaId,
            Forma      = forma,
            Valor      = valor,
            Parcelas   = parcelas,
            TaxaJuros  = taxaJuros
        };
        pagamento.SetCreated(criadoPor);
        return pagamento;
    }
}
