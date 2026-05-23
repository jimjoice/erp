using ERP.Application.Cadastros.Common;
using ERP.Domain.Enums;
using FluentValidation;

namespace ERP.Application.Cadastros.Clientes;

public class CreateClienteDtoValidator : AbstractValidator<CreateClienteDto>
{
    public CreateClienteDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.TipoPessoa).IsInEnum().WithMessage("Tipo de pessoa inválido.");
        RuleFor(x => x.CpfCnpj)
            .NotEmpty().WithMessage("CPF/CNPJ é obrigatório.")
            .Must((dto, valor) =>
            {
                var digits = CpfCnpjHelper.SomenteDigitos(valor);
                return dto.TipoPessoa == TipoPessoa.PF
                    ? CpfCnpjHelper.IsValidCpf(digits)
                    : CpfCnpjHelper.IsValidCnpj(digits);
            })
            .WithMessage("CPF ou CNPJ inválido.");
        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(200)
            .When(x => x.Email is not null);
        RuleFor(x => x.Telefone).MaximumLength(20).When(x => x.Telefone is not null);
        RuleFor(x => x.Endereco)
            .SetValidator(new EnderecoValidator()!)
            .When(x => x.Endereco is not null);
    }
}

public class UpdateClienteDtoValidator : AbstractValidator<UpdateClienteDto>
{
    public UpdateClienteDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido.")
            .MaximumLength(200)
            .When(x => x.Email is not null);
        RuleFor(x => x.Telefone).MaximumLength(20).When(x => x.Telefone is not null);
        RuleFor(x => x.Endereco)
            .SetValidator(new EnderecoValidator()!)
            .When(x => x.Endereco is not null);
    }
}
