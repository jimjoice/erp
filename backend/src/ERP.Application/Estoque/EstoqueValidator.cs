using FluentValidation;

namespace ERP.Application.Estoque;

public class EntradaMercadoriaValidator : AbstractValidator<EntradaMercadoriaDto>
{
    public EntradaMercadoriaValidator()
    {
        RuleFor(x => x.ProdutoId).NotEmpty();
        RuleFor(x => x.Quantidade).GreaterThan(0);
        RuleFor(x => x.CustoUnitario).GreaterThanOrEqualTo(0);
        RuleFor(x => x.NumeroNF).MaximumLength(100).When(x => x.NumeroNF != null);
    }
}

public class SaidaManualValidator : AbstractValidator<SaidaManualDto>
{
    public SaidaManualValidator()
    {
        RuleFor(x => x.ProdutoId).NotEmpty();
        RuleFor(x => x.Quantidade).GreaterThan(0);
        RuleFor(x => x.Descricao).MaximumLength(500).When(x => x.Descricao != null);
    }
}

public class AjusteInventarioValidator : AbstractValidator<AjusteInventarioDto>
{
    public AjusteInventarioValidator()
    {
        RuleFor(x => x.Itens)
            .NotEmpty().WithMessage("A lista de itens não pode ser vazia.")
            .Must(itens => itens.Select(i => i.ProdutoId).Distinct().Count() == itens.Count)
            .WithMessage("Não é permitido informar o mesmo produto mais de uma vez.");

        RuleFor(x => x.Descricao).MaximumLength(500).When(x => x.Descricao != null);

        RuleForEach(x => x.Itens).ChildRules(item =>
        {
            item.RuleFor(i => i.ProdutoId).NotEmpty();
            item.RuleFor(i => i.QuantidadeReal).GreaterThanOrEqualTo(0);
        });
    }
}
