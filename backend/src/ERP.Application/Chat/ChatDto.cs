namespace ERP.Application.Chat;

public record ChatSessaoDto(
    Guid Id,
    string Titulo,
    string Status,
    int TotalMensagens,
    DateTime CreatedAt);

public record ChatMensagemDto(
    Guid Id,
    Guid SessaoId,
    string Conteudo,
    string Origem,
    string StatusEntrega,
    int? TempoRespostaMs,
    DateTime CreatedAt);

public record EnviarMensagemDto(string Conteudo);

public record HistoricoResponseDto(Guid SessaoId, List<ChatMensagemDto> Mensagens);
