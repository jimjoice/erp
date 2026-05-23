using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class ContaPagar : BaseEntity
{
    public Guid FornecedorId { get; private set; }
    public string Descricao { get; private set; } = string.Empty;
    public decimal Valor { get; private set; }
    public DateTime DataVencimento { get; private set; }
    public DateTime? DataPagamento { get; private set; }
    public StatusContaPagar Status { get; private set; }

    public Fornecedor? Fornecedor { get; private set; }

    private ContaPagar() { }

    public static ContaPagar Create(
        Guid fornecedorId,
        string descricao,
        decimal valor,
        DateTime dataVencimento,
        string criadoPor)
    {
        var conta = new ContaPagar
        {
            FornecedorId   = fornecedorId,
            Descricao      = descricao,
            Valor          = valor,
            DataVencimento = dataVencimento,
            Status         = StatusContaPagar.Aberta
        };
        conta.SetCreated(criadoPor);
        return conta;
    }

    public void Pagar(DateTime dataPagamento, string pagoPor)
    {
        if (Status == StatusContaPagar.Paga)
            throw new InvalidOperationException("Conta já está paga.");

        if (Status == StatusContaPagar.Cancelada)
            throw new InvalidOperationException("Conta cancelada não pode ser paga.");

        DataPagamento = dataPagamento;
        Status = StatusContaPagar.Paga;
        SetUpdated(pagoPor);
    }

    public void MarcarVencida(string atualizadoPor)
    {
        if (Status != StatusContaPagar.Aberta)
            throw new InvalidOperationException("Apenas contas abertas podem ser marcadas como vencidas.");

        Status = StatusContaPagar.Vencida;
        SetUpdated(atualizadoPor);
    }

    public void Cancelar(string canceladoPor)
    {
        if (Status == StatusContaPagar.Cancelada)
            throw new InvalidOperationException("Conta já está cancelada.");

        if (Status == StatusContaPagar.Paga)
            throw new InvalidOperationException("Conta paga não pode ser cancelada diretamente.");

        Status = StatusContaPagar.Cancelada;
        SetUpdated(canceladoPor);
    }
}
