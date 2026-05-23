using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class ChatSessao : BaseEntity
{
    private readonly List<ChatMensagem> _mensagens = [];

    public Guid UsuarioId { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public StatusSessaoChat Status { get; private set; }
    public int TotalMensagens { get; private set; }

    public IReadOnlyList<ChatMensagem> Mensagens => _mensagens.AsReadOnly();

    private ChatSessao() { }

    public static ChatSessao Create(Guid usuarioId, string criadoPor)
    {
        var sessao = new ChatSessao
        {
            UsuarioId      = usuarioId,
            Titulo         = $"Conversa de {DateTime.UtcNow:dd/MM/yyyy HH:mm}",
            Status         = StatusSessaoChat.Ativa,
            TotalMensagens = 0
        };
        sessao.SetCreated(criadoPor);
        return sessao;
    }

    public void AlterarTitulo(string titulo, string atualizadoPor)
    {
        if (Status == StatusSessaoChat.Encerrada)
            throw new InvalidOperationException("Não é possível alterar o título de uma sessão encerrada.");

        Titulo = titulo;
        SetUpdated(atualizadoPor);
    }

    public void Encerrar(string atualizadoPor)
    {
        if (Status == StatusSessaoChat.Encerrada)
            throw new InvalidOperationException("Sessão já está encerrada.");

        Status = StatusSessaoChat.Encerrada;
        SetUpdated(atualizadoPor);
    }

    public void IncrementarTotalMensagens(string atualizadoPor)
    {
        TotalMensagens++;
        SetUpdated(atualizadoPor);
    }
}
