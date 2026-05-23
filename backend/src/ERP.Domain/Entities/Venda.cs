using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class Venda : BaseEntity
{
    private const decimal DescontoMaximoPermitido = 0.30m;

    private readonly List<ItemVenda> _itens = [];
    private readonly List<Pagamento> _pagamentos = [];

    public int Numero { get; private set; }
    public Guid? ClienteId { get; private set; }
    public Guid FuncionarioId { get; private set; }
    public StatusVenda Status { get; private set; }
    public DateTime DataVenda { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Total { get; private set; }
    public string? Observacao { get; private set; }

    public Cliente? Cliente { get; private set; }
    public Funcionario? Funcionario { get; private set; }
    public IReadOnlyList<ItemVenda> Itens => _itens.AsReadOnly();
    public IReadOnlyList<Pagamento> Pagamentos => _pagamentos.AsReadOnly();

    private Venda() { }

    public static Venda Create(
        Guid? clienteId,
        Guid funcionarioId,
        string? observacao,
        string criadoPor)
    {
        var venda = new Venda
        {
            ClienteId     = clienteId,
            FuncionarioId = funcionarioId,
            Status        = StatusVenda.Orcamento,
            DataVenda     = DateTime.UtcNow,
            Subtotal      = 0,
            Desconto      = 0,
            Total         = 0,
            Observacao    = observacao
        };
        venda.SetCreated(criadoPor);
        return venda;
    }

    public void AdicionarItem(
        Produto produto,
        decimal quantidade,
        decimal precoUnitario,
        decimal desconto,
        string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Itens só podem ser adicionados em orçamentos.");

        if (quantidade <= 0)
            throw new InvalidOperationException("Quantidade deve ser maior que zero.");

        if (produto.EstoqueAtual < quantidade)
            throw new InvalidOperationException(
                $"Estoque insuficiente. Disponível: {produto.EstoqueAtual}, solicitado: {quantidade}.");

        if (desconto < 0)
            throw new InvalidOperationException("Desconto do item não pode ser negativo.");

        var subtotalItem = (quantidade * precoUnitario) - desconto;
        if (subtotalItem < 0)
            throw new InvalidOperationException("Desconto não pode ser maior que o valor do item.");

        _itens.Add(ItemVenda.Create(Id, produto.Id, quantidade, precoUnitario, desconto, atualizadoPor));
        RecalcularTotais();
        SetUpdated(atualizadoPor);
    }

    public void RemoverItem(Guid itemId, string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Itens só podem ser removidos em orçamentos.");

        var item = _itens.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException("Item não encontrado na venda.");

        _itens.Remove(item);
        RecalcularTotais();
        SetUpdated(atualizadoPor);
    }

    /// <param name="percentual">Valor entre 0 e 0.30 (0% a 30%)</param>
    public void AplicarDesconto(decimal percentual, string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Desconto só pode ser aplicado em orçamentos.");

        if (percentual < 0 || percentual > DescontoMaximoPermitido)
            throw new InvalidOperationException(
                $"Desconto deve estar entre 0% e {DescontoMaximoPermitido * 100}%.");

        Desconto = Math.Round(Subtotal * percentual, 2);
        Total = Subtotal - Desconto;
        SetUpdated(atualizadoPor);
    }

    public void AdicionarPagamento(
        FormaPagamento forma,
        decimal valor,
        int parcelas,
        decimal taxaJuros,
        string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Pagamentos só podem ser adicionados em orçamentos.");

        if (valor <= 0)
            throw new InvalidOperationException("Valor do pagamento deve ser maior que zero.");

        if (parcelas < 1)
            throw new InvalidOperationException("Número de parcelas deve ser pelo menos 1.");

        if (parcelas > 1 && forma != FormaPagamento.Credito && forma != FormaPagamento.Crediario)
            throw new InvalidOperationException("Parcelamento disponível apenas para crédito e crediário.");

        if (taxaJuros < 0)
            throw new InvalidOperationException("Taxa de juros não pode ser negativa.");

        _pagamentos.Add(Pagamento.Create(Id, forma, valor, parcelas, taxaJuros, atualizadoPor));
        SetUpdated(atualizadoPor);
    }

    public void Confirmar(string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Apenas orçamentos podem ser confirmados.");

        if (_itens.Count == 0)
            throw new InvalidOperationException("A venda deve ter pelo menos um item.");

        Status = StatusVenda.Confirmada;
        DataVenda = DateTime.UtcNow;
        SetUpdated(atualizadoPor);
    }

    public void Cancelar(string atualizadoPor)
    {
        if (Status == StatusVenda.Cancelada)
            throw new InvalidOperationException("Venda já está cancelada.");

        if (Status == StatusVenda.Confirmada && DateTime.UtcNow > DataVenda.AddHours(24))
            throw new InvalidOperationException(
                "Cancelamento permitido somente em até 24 horas após a confirmação da venda.");

        Status = StatusVenda.Cancelada;
        SetUpdated(atualizadoPor);
    }

    public void AtualizarObservacao(string? observacao, string atualizadoPor)
    {
        if (Status != StatusVenda.Orcamento)
            throw new InvalidOperationException("Observação só pode ser alterada em orçamentos.");

        Observacao = observacao;
        SetUpdated(atualizadoPor);
    }

    private void RecalcularTotais()
    {
        Subtotal = _itens.Sum(i => i.Subtotal);
        Total = Subtotal - Desconto;
    }
}
