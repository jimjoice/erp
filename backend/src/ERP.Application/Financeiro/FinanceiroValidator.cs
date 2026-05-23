using FluentValidation;

namespace ERP.Application.Financeiro;

public class BaixarContaDtoValidator : AbstractValidator<BaixarContaDto>
{
    public BaixarContaDtoValidator()
    {
        RuleFor(x => x.DataPagamento)
            .NotEmpty()
            .LessThanOrEqualTo(_ => DateTime.UtcNow.AddDays(1))
            .WithMessage("Data de pagamento não pode ser futura.");

        RuleFor(x => x.ValorPago)
            .GreaterThan(0)
            .WithMessage("Valor pago deve ser maior que zero.");
    }
}
