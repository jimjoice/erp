using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class Produto : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public string? CodigoBarras { get; private set; }
    public string? Ncm { get; private set; }
    public string? Descricao { get; private set; }
    public decimal PrecoCusto { get; private set; }
    public decimal PrecoVenda { get; private set; }
    public decimal EstoqueAtual { get; private set; }
    public decimal EstoqueMinimo { get; private set; }
    public UnidadeMedida UnidadeMedida { get; private set; }
    public Guid CategoriaId { get; private set; }
    public Categoria? Categoria { get; private set; }

    private Produto() { }

    public static Produto Create(
        string nome,
        string sku,
        string? codigoBarras,
        string? ncm,
        string? descricao,
        decimal precoCusto,
        decimal precoVenda,
        decimal estoqueMinimo,
        UnidadeMedida unidadeMedida,
        Guid categoriaId,
        string criadoPor)
    {
        var produto = new Produto
        {
            Nome = nome,
            Sku = sku,
            CodigoBarras = codigoBarras,
            Ncm = ncm,
            Descricao = descricao,
            PrecoCusto = precoCusto,
            PrecoVenda = precoVenda,
            EstoqueAtual = 0,
            EstoqueMinimo = estoqueMinimo,
            UnidadeMedida = unidadeMedida,
            CategoriaId = categoriaId
        };
        produto.SetCreated(criadoPor);
        return produto;
    }

    public void Atualizar(
        string nome,
        string? codigoBarras,
        string? ncm,
        string? descricao,
        decimal precoCusto,
        decimal precoVenda,
        decimal estoqueMinimo,
        UnidadeMedida unidadeMedida,
        Guid categoriaId,
        string atualizadoPor)
    {
        Nome = nome;
        CodigoBarras = codigoBarras;
        Ncm = ncm;
        Descricao = descricao;
        PrecoCusto = precoCusto;
        PrecoVenda = precoVenda;
        EstoqueMinimo = estoqueMinimo;
        UnidadeMedida = unidadeMedida;
        CategoriaId = categoriaId;
        SetUpdated(atualizadoPor);
    }

    public void AtualizarEstoque(decimal novaQuantidade, string atualizadoPor)
    {
        EstoqueAtual = novaQuantidade;
        SetUpdated(atualizadoPor);
    }

    public void AtualizarPrecos(decimal precoCusto, decimal precoVenda, string atualizadoPor)
    {
        PrecoCusto = precoCusto;
        PrecoVenda = precoVenda;
        SetUpdated(atualizadoPor);
    }

    public bool EstoqueAbaixoDoMinimo => EstoqueAtual < EstoqueMinimo;
}
