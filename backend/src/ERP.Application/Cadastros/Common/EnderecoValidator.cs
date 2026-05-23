using FluentValidation;

namespace ERP.Application.Cadastros.Common;

public class EnderecoValidator : AbstractValidator<EnderecoDto>
{
    public EnderecoValidator()
    {
        RuleFor(x => x.Cep)
            .NotEmpty().WithMessage("CEP é obrigatório.")
            .Matches(@"^\d{8}$").WithMessage("CEP deve conter exatamente 8 dígitos.");

        RuleFor(x => x.Logradouro)
            .NotEmpty().WithMessage("Logradouro é obrigatório.")
            .MaximumLength(200);

        RuleFor(x => x.Numero)
            .NotEmpty().WithMessage("Número é obrigatório.")
            .MaximumLength(20);

        RuleFor(x => x.Complemento)
            .MaximumLength(100)
            .When(x => x.Complemento is not null);

        RuleFor(x => x.Bairro)
            .NotEmpty().WithMessage("Bairro é obrigatório.")
            .MaximumLength(100);

        RuleFor(x => x.Cidade)
            .NotEmpty().WithMessage("Cidade é obrigatória.")
            .MaximumLength(100);

        RuleFor(x => x.Uf)
            .NotEmpty()
            .Matches(@"^[A-Z]{2}$").WithMessage("UF deve ter exatamente 2 letras maiúsculas.");
    }
}
