using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class LancamentoCaixa : BaseEntity
{
    public TipoLancamentoCaixa Tipo { get; private set; }
    public decimal Valor { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public Guid? ContaReceberId { get; private set; }
    public Guid? ContaPagarId { get; private set; }

    public ContaReceber? ContaReceber { get; private set; }
    public ContaPagar? ContaPagar { get; private set; }

    private LancamentoCaixa() { }

    public static LancamentoCaixa Create(
        TipoLancamentoCaixa tipo,
        decimal valor,
        string descricao,
        string criadoPor,
        Guid? contaReceberId = null,
        Guid? contaPagarId = null)
    {
        var lancamento = new LancamentoCaixa
        {
            Tipo           = tipo,
            Valor          = valor,
            Descricao      = descricao,
            ContaReceberId = contaReceberId,
            ContaPagarId   = contaPagarId
        };
        lancamento.SetCreated(criadoPor);
        return lancamento;
    }
}
