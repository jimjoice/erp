using ERP.Application.Cadastros.Common;
using FluentValidation;

namespace ERP.Application.Cadastros.Fornecedores;

public class CreateFornecedorDtoValidator : AbstractValidator<CreateFornecedorDto>
{
    public CreateFornecedorDtoValidator()
    {
        RuleFor(x => x.RazaoSocial).NotEmpty().WithMessage("Razão social é obrigatória.").MaximumLength(200);
        RuleFor(x => x.Cnpj)
            .NotEmpty().WithMessage("CNPJ é obrigatório.")
            .Must(cnpj => CpfCnpjHelper.IsValidCnpj(CpfCnpjHelper.SomenteDigitos(cnpj)))
            .WithMessage("CNPJ inválido.");
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

public class UpdateFornecedorDtoValidator : AbstractValidator<UpdateFornecedorDto>
{
    public UpdateFornecedorDtoValidator()
    {
        RuleFor(x => x.RazaoSocial).NotEmpty().WithMessage("Razão social é obrigatória.").MaximumLength(200);
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
