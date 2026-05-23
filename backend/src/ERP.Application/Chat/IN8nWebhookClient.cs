namespace ERP.Application.Chat;

public interface IN8nWebhookClient
{
    Task<string> EnviarMensagemAsync(
        string mensagem,
        Guid usuarioId,
        Guid sessaoId,
        CancellationToken ct = default);
}
