using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class ContaReceber : BaseEntity
{
    public Guid? VendaId { get; private set; }
    public Guid? ClienteId { get; private set; }
    public FormaPagamento FormaPagamento { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public decimal Valor { get; private set; }
    public int NumeroParcela { get; private set; }
    public int TotalParcelas { get; private set; }
    public DateTime DataVencimento { get; private set; }
    public DateTime? DataPagamento { get; private set; }
    public StatusContaReceber Status { get; private set; }

    public Venda? Venda { get; private set; }
    public Cliente? Cliente { get; private set; }

    private ContaReceber() { }

    public static ContaReceber Create(
        Guid? vendaId,
        Guid? clienteId,
        FormaPagamento formaPagamento,
        string descricao,
        decimal valor,
        int numeroParcela,
        int totalParcelas,
        DateTime dataVencimento,
        bool jaPaga,
        string criadoPor)
    {
        var conta = new ContaReceber
        {
            VendaId        = vendaId,
            ClienteId      = clienteId,
            FormaPagamento = formaPagamento,
            Descricao      = descricao,
            Valor          = valor,
            NumeroParcela  = numeroParcela,
            TotalParcelas  = totalParcelas,
            DataVencimento = dataVencimento,
            Status         = jaPaga ? StatusContaReceber.Paga : StatusContaReceber.Aberta,
            DataPagamento  = jaPaga ? DateTime.UtcNow : null
        };
        conta.SetCreated(criadoPor);
        return conta;
    }

    public void Pagar(DateTime dataPagamento, string pagoPor)
    {
        if (Status == StatusContaReceber.Paga)
            throw new InvalidOperationException("Conta já está paga.");

        if (Status == StatusContaReceber.Cancelada)
            throw new InvalidOperationException("Conta cancelada não pode ser paga.");

        DataPagamento = dataPagamento;
        Status = StatusContaReceber.Paga;
        SetUpdated(pagoPor);
    }

    public void Cancelar(string canceladoPor)
    {
        if (Status == StatusContaReceber.Cancelada)
            throw new InvalidOperationException("Conta já está cancelada.");

        if (Status == StatusContaReceber.Paga)
            throw new InvalidOperationException("Conta paga não pode ser cancelada diretamente.");

        Status = StatusContaReceber.Cancelada;
        SetUpdated(canceladoPor);
    }
}
