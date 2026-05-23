using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class MovimentacaoEstoque : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public Produto? Produto { get; private set; }
    public TipoMovimentacaoEstoque Tipo { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal QuantidadeAnterior { get; private set; }
    public decimal QuantidadeResultante { get; private set; }
    public MotivoMovimentacaoEstoque MotivoCodigo { get; private set; }
    public string? Descricao { get; private set; }
    public string? DocumentoOrigem { get; private set; }

    private MovimentacaoEstoque() { }

    /// <summary>
    /// Cria a movimentação e atualiza o estoque do produto atomicamente.
    /// Lança InvalidOperationException se resultar em estoque negativo.
    /// </summary>
    public static MovimentacaoEstoque Criar(
        Produto produto,
        TipoMovimentacaoEstoque tipo,
        decimal quantidade,
        MotivoMovimentacaoEstoque motivoCodigo,
        string? descricao,
        string? documentoOrigem,
        string criadoPor)
    {
        if (quantidade < 0)
            throw new InvalidOperationException("Quantidade não pode ser negativa.");

        if (tipo != TipoMovimentacaoEstoque.Inventario && quantidade == 0)
            throw new InvalidOperationException("Quantidade deve ser maior que zero.");

        var quantidadeAnterior = produto.EstoqueAtual;

        var quantidadeResultante = tipo switch
        {
            TipoMovimentacaoEstoque.Entrada    => quantidadeAnterior + quantidade,
            TipoMovimentacaoEstoque.Saida      => quantidadeAnterior - quantidade,
            TipoMovimentacaoEstoque.Ajuste when motivoCodigo == MotivoMovimentacaoEstoque.AjusteNegativo
                                               => quantidadeAnterior - quantidade,
            TipoMovimentacaoEstoque.Ajuste     => quantidadeAnterior + quantidade,
            TipoMovimentacaoEstoque.Inventario => quantidade,
            _                                  => throw new InvalidOperationException("Tipo de movimentação inválido.")
        };

        if (quantidadeResultante < 0)
            throw new InvalidOperationException(
                $"Operação resultaria em estoque negativo (atual: {quantidadeAnterior}, solicitado: {quantidade}).");

        produto.AtualizarEstoque(quantidadeResultante, criadoPor);

        var mov = new MovimentacaoEstoque
        {
            ProdutoId            = produto.Id,
            Tipo                 = tipo,
            Quantidade           = quantidade,
            QuantidadeAnterior   = quantidadeAnterior,
            QuantidadeResultante = quantidadeResultante,
            MotivoCodigo         = motivoCodigo,
            Descricao            = descricao,
            DocumentoOrigem      = documentoOrigem
        };
        mov.SetCreated(criadoPor);
        return mov;
    }
}
