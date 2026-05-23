using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public class ItemVenda : BaseEntity
{
    public Guid VendaId { get; private set; }
    public Guid ProdutoId { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal PrecoUnitario { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Subtotal { get; private set; }

    public Venda? Venda { get; private set; }
    public Produto? Produto { get; private set; }

    private ItemVenda() { }

    internal static ItemVenda Create(
        Guid vendaId,
        Guid produtoId,
        decimal quantidade,
        decimal precoUnitario,
        decimal desconto,
        string criadoPor)
    {
        var item = new ItemVenda
        {
            VendaId       = vendaId,
            ProdutoId     = produtoId,
            Quantidade    = quantidade,
            PrecoUnitario = precoUnitario,
            Desconto      = desconto,
            Subtotal      = (quantidade * precoUnitario) - desconto
        };
        item.SetCreated(criadoPor);
        return item;
    }
}
