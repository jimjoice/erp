using FluentValidation;

namespace ERP.Application.Cadastros.Produtos;

public class CreateProdutoDtoValidator : AbstractValidator<CreateProdutoDto>
{
    public CreateProdutoDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().WithMessage("SKU é obrigatório.").MaximumLength(50);
        RuleFor(x => x.CodigoBarras).MaximumLength(50).When(x => x.CodigoBarras is not null);
        RuleFor(x => x.Ncm)
            .Matches(@"^\d{8}$").WithMessage("NCM deve ter exatamente 8 dígitos.")
            .When(x => x.Ncm is not null);
        RuleFor(x => x.Descricao).MaximumLength(1000).When(x => x.Descricao is not null);
        RuleFor(x => x.PrecoCusto).GreaterThanOrEqualTo(0).WithMessage("Preço de custo não pode ser negativo.");
        RuleFor(x => x.PrecoVenda).GreaterThan(0).WithMessage("Preço de venda deve ser maior que zero.");
        RuleFor(x => x.EstoqueMinimo).GreaterThanOrEqualTo(0).WithMessage("Estoque mínimo não pode ser negativo.");
        RuleFor(x => x.UnidadeMedida).IsInEnum().WithMessage("Unidade de medida inválida.");
        RuleFor(x => x.CategoriaId).NotEmpty().WithMessage("Categoria é obrigatória.");
    }
}

public class UpdateProdutoDtoValidator : AbstractValidator<UpdateProdutoDto>
{
    public UpdateProdutoDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.CodigoBarras).MaximumLength(50).When(x => x.CodigoBarras is not null);
        RuleFor(x => x.Ncm)
            .Matches(@"^\d{8}$").WithMessage("NCM deve ter exatamente 8 dígitos.")
            .When(x => x.Ncm is not null);
        RuleFor(x => x.Descricao).MaximumLength(1000).When(x => x.Descricao is not null);
        RuleFor(x => x.PrecoCusto).GreaterThanOrEqualTo(0).WithMessage("Preço de custo não pode ser negativo.");
        RuleFor(x => x.PrecoVenda).GreaterThan(0).WithMessage("Preço de venda deve ser maior que zero.");
        RuleFor(x => x.EstoqueMinimo).GreaterThanOrEqualTo(0).WithMessage("Estoque mínimo não pode ser negativo.");
        RuleFor(x => x.UnidadeMedida).IsInEnum().WithMessage("Unidade de medida inválida.");
        RuleFor(x => x.CategoriaId).NotEmpty().WithMessage("Categoria é obrigatória.");
    }
}
