using ERP.Domain.Enums;
using FluentValidation;

namespace ERP.Application.Vendas;

public class CriarOrcamentoDtoValidator : AbstractValidator<CriarOrcamentoDto>
{
    public CriarOrcamentoDtoValidator()
    {
        RuleFor(x => x.FuncionarioId).NotEmpty().WithMessage("Funcionário é obrigatório.");
        RuleFor(x => x.Itens).NotEmpty().WithMessage("A venda deve ter pelo menos um item.");
        RuleForEach(x => x.Itens).SetValidator(new ItemOrcamentoDtoValidator());
    }
}

public class ItemOrcamentoDtoValidator : AbstractValidator<ItemOrcamentoDto>
{
    public ItemOrcamentoDtoValidator()
    {
        RuleFor(x => x.ProdutoId).NotEmpty().WithMessage("Produto é obrigatório.");
        RuleFor(x => x.Quantidade).GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");
        RuleFor(x => x.Desconto).GreaterThanOrEqualTo(0).WithMessage("Desconto não pode ser negativo.");
    }
}

public class AdicionarItemVendaDtoValidator : AbstractValidator<AdicionarItemVendaDto>
{
    public AdicionarItemVendaDtoValidator()
    {
        RuleFor(x => x.ProdutoId).NotEmpty().WithMessage("Produto é obrigatório.");
        RuleFor(x => x.Quantidade).GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");
        RuleFor(x => x.Desconto).GreaterThanOrEqualTo(0).WithMessage("Desconto não pode ser negativo.");
    }
}

public class AplicarDescontoDtoValidator : AbstractValidator<AplicarDescontoDto>
{
    public AplicarDescontoDtoValidator()
    {
        RuleFor(x => x.Percentual)
            .InclusiveBetween(0m, 0.30m)
            .WithMessage("Desconto deve estar entre 0% e 30%.");
    }
}

public class FinalizarVendaDtoValidator : AbstractValidator<FinalizarVendaDto>
{
    public FinalizarVendaDtoValidator()
    {
        RuleFor(x => x.Pagamentos).NotEmpty().WithMessage("Informe pelo menos uma forma de pagamento.");
        RuleForEach(x => x.Pagamentos).SetValidator(new PagamentoInputDtoValidator());
    }
}

public class PagamentoInputDtoValidator : AbstractValidator<PagamentoInputDto>
{
    public PagamentoInputDtoValidator()
    {
        RuleFor(x => x.Valor).GreaterThan(0).WithMessage("Valor do pagamento deve ser maior que zero.");
        RuleFor(x => x.Parcelas).GreaterThanOrEqualTo(1).WithMessage("Número de parcelas deve ser pelo menos 1.");
        RuleFor(x => x.TaxaJuros).GreaterThanOrEqualTo(0).WithMessage("Taxa de juros não pode ser negativa.");
        RuleFor(x => x.Parcelas)
            .Must((dto, parcelas) =>
                parcelas == 1 ||
                dto.Forma == FormaPagamento.Credito ||
                dto.Forma == FormaPagamento.Crediario)
            .WithMessage("Parcelamento disponível apenas para crédito e crediário.");
    }
}

public class CancelarVendaDtoValidator : AbstractValidator<CancelarVendaDto>
{
    public CancelarVendaDtoValidator()
    {
        RuleFor(x => x.Motivo).NotEmpty().WithMessage("Motivo do cancelamento é obrigatório.")
            .MaximumLength(500);
    }
}
