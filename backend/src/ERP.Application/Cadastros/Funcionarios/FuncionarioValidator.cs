using ERP.Application.Cadastros.Common;
using FluentValidation;

namespace ERP.Application.Cadastros.Funcionarios;

public class CreateFuncionarioDtoValidator : AbstractValidator<CreateFuncionarioDto>
{
    public CreateFuncionarioDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.Cpf)
            .NotEmpty().WithMessage("CPF é obrigatório.")
            .Must(cpf => CpfCnpjHelper.IsValidCpf(CpfCnpjHelper.SomenteDigitos(cpf)))
            .WithMessage("CPF inválido.");
        RuleFor(x => x.Cargo).NotEmpty().WithMessage("Cargo é obrigatório.").MaximumLength(100);
        RuleFor(x => x.Salario).GreaterThan(0).WithMessage("Salário deve ser maior que zero.");
        RuleFor(x => x.DataAdmissao)
            .NotEmpty()
            .LessThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Data de admissão não pode ser futura.");
    }
}

public class UpdateFuncionarioDtoValidator : AbstractValidator<UpdateFuncionarioDto>
{
    public UpdateFuncionarioDtoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().WithMessage("Nome é obrigatório.").MaximumLength(200);
        RuleFor(x => x.Cargo).NotEmpty().WithMessage("Cargo é obrigatório.").MaximumLength(100);
        RuleFor(x => x.Salario).GreaterThan(0).WithMessage("Salário deve ser maior que zero.");
    }
}
