using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ERP.Application.Chat;
using Microsoft.Extensions.Configuration;

namespace ERP.Infrastructure.ExternalServices;

public class N8nWebhookClient(HttpClient httpClient, IConfiguration configuration) : IN8nWebhookClient
{
    private readonly string _webhookUrl = configuration["N8n:WebhookUrl"]
        ?? throw new InvalidOperationException("N8n:WebhookUrl não configurado.");

    public async Task<string> EnviarMensagemAsync(
        string mensagem,
        Guid usuarioId,
        Guid sessaoId,
        CancellationToken ct = default)
    {
        var payload = new
        {
            mensagem,
            usuarioId = usuarioId.ToString(),
            sessaoId  = sessaoId.ToString(),
            timestamp = DateTime.UtcNow.ToString("O")
        };

        var response = await httpClient.PostAsJsonAsync(_webhookUrl, payload, ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<N8nResponse>(ct)
            ?? throw new InvalidOperationException("Resposta inválida do n8n: corpo vazio.");

        return result.Resposta;
    }

    private record N8nResponse([property: JsonPropertyName("resposta")] string Resposta);
}
