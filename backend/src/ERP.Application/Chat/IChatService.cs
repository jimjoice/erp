using ERP.Application.Common;

namespace ERP.Application.Chat;

public interface IChatService
{
    Task<Result<ChatSessaoDto>> ObterOuCriarSessaoAsync(
        Guid usuarioId, CancellationToken ct = default);

    Task<Result<List<ChatMensagemDto>>> ObterHistoricoAsync(
        Guid sessaoId, CancellationToken ct = default);

    Task<Result<ChatMensagemDto>> EnviarMensagemAsync(
        Guid usuarioId, string conteudo, CancellationToken ct = default);

    Task<Result> EncerrarSessaoAsync(Guid usuarioId, CancellationToken ct = default);
}
