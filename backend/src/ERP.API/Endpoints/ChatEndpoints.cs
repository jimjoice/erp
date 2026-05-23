using ERP.API.Extensions;
using ERP.Application.Chat;
using FluentValidation;

namespace ERP.API.Endpoints;

public static class ChatEndpoints
{
    public static IEndpointRouteBuilder MapChat(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/chat")
            .WithTags("Chat")
            .RequireAuthorization("Vendedor");

        group.MapGet("/historico", GetHistorico)
            .WithName("GetChatHistorico")
            .WithSummary("Obtém ou cria sessão do usuário e retorna o histórico de mensagens");

        group.MapPost("/mensagem", EnviarMensagem)
            .WithName("EnviarChatMensagem")
            .WithSummary("Envia mensagem ao agente e retorna a resposta");

        group.MapPost("/sessao/encerrar", EncerrarSessao)
            .WithName("EncerrarChatSessao")
            .WithSummary("Encerra a sessão ativa do usuário");

        return app;
    }

    private static async Task<IResult> GetHistorico(
        IChatService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var usuarioId = ObterUsuarioId(httpContext);
        if (usuarioId is null)
            return Results.Problem(detail: "Token inválido.", statusCode: 401, title: "Não autenticado");

        var sessaoResult = await service.ObterOuCriarSessaoAsync(usuarioId.Value, ct);
        if (!sessaoResult.Success)
            return sessaoResult.ToHttpResult();

        var historicoResult = await service.ObterHistoricoAsync(sessaoResult.Data!.Id, ct);
        if (!historicoResult.Success)
            return historicoResult.ToHttpResult();

        return Results.Ok(new HistoricoResponseDto(sessaoResult.Data.Id, historicoResult.Data!));
    }

    private static async Task<IResult> EnviarMensagem(
        EnviarMensagemDto dto,
        IChatService service,
        IValidator<EnviarMensagemDto> validator,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return Results.ValidationProblem(validation.ToDictionary());

        var usuarioId = ObterUsuarioId(httpContext);
        if (usuarioId is null)
            return Results.Problem(detail: "Token inválido.", statusCode: 401, title: "Não autenticado");

        var result = await service.EnviarMensagemAsync(usuarioId.Value, dto.Conteudo, ct);
        return result.ToHttpResult();
    }

    private static async Task<IResult> EncerrarSessao(
        IChatService service,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var usuarioId = ObterUsuarioId(httpContext);
        if (usuarioId is null)
            return Results.Problem(detail: "Token inválido.", statusCode: 401, title: "Não autenticado");

        var result = await service.EncerrarSessaoAsync(usuarioId.Value, ct);
        return result.ToHttpResult();
    }

    private static Guid? ObterUsuarioId(HttpContext ctx)
    {
        var sub = ctx.User.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }
}
