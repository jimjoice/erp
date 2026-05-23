using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ERP.Application.Chat;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERP.Infrastructure.ExternalServices;

public class N8nWebhookClient(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<N8nWebhookClient> logger) : IN8nWebhookClient
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

        logger.LogDebug("N8n request → URL: {Url} | Payload: {Payload}",
            _webhookUrl,
            JsonSerializer.Serialize(payload));

        try
        {
            var response = await httpClient.PostAsJsonAsync(_webhookUrl, payload, ct);

            logger.LogDebug("N8n response ← StatusCode: {StatusCode}", (int)response.StatusCode);

            var rawBody = await response.Content.ReadAsStringAsync(ct);

            logger.LogDebug("N8n response body: {Body}", rawBody);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<N8nResponseItem>(ct)
    ?? throw new InvalidOperationException("Resposta inválida do n8n: corpo vazio.");
return result.Item;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao chamar n8n webhook. URL: {Url}", _webhookUrl);
            throw;
        }
    }

    private record N8nResponseItem([property: JsonPropertyName("item")] string Item);
}
