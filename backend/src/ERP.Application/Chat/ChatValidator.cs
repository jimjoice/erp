using FluentValidation;

namespace ERP.Application.Chat;

public class EnviarMensagemDtoValidator : AbstractValidator<EnviarMensagemDto>
{
    public EnviarMensagemDtoValidator()
    {
        RuleFor(x => x.Conteudo)
            .NotEmpty().WithMessage("Conteúdo é obrigatório.")
            .MaximumLength(4000).WithMessage("Conteúdo não pode ultrapassar 4000 caracteres.");
    }
}
