using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class ChatMensagem : BaseEntity
{
    public Guid SessaoId { get; private set; }
    public string Conteudo { get; private set; } = string.Empty;
    public OrigemMensagem Origem { get; private set; }
    public StatusEntregaMensagem StatusEntrega { get; private set; }
    public int? TempoRespostaMs { get; private set; }

    public ChatSessao Sessao { get; private set; } = null!;

    private ChatMensagem() { }

    public static ChatMensagem Create(
        Guid sessaoId,
        string conteudo,
        OrigemMensagem origem,
        string criadoPor)
    {
        var mensagem = new ChatMensagem
        {
            SessaoId      = sessaoId,
            Conteudo      = conteudo,
            Origem        = origem,
            StatusEntrega = StatusEntregaMensagem.Enviada,
            TempoRespostaMs = null
        };
        mensagem.SetCreated(criadoPor);
        return mensagem;
    }

    public void MarcarComoProcessando(string atualizadoPor)
    {
        StatusEntrega = StatusEntregaMensagem.Processando;
        SetUpdated(atualizadoPor);
    }

    public void MarcarComoEntregue(int tempoRespostaMs, string atualizadoPor)
    {
        if (tempoRespostaMs < 0)
            throw new InvalidOperationException("Tempo de resposta não pode ser negativo.");

        StatusEntrega   = StatusEntregaMensagem.Entregue;
        TempoRespostaMs = tempoRespostaMs;
        SetUpdated(atualizadoPor);
    }

    public void MarcarComoErro(string atualizadoPor)
    {
        StatusEntrega = StatusEntregaMensagem.Erro;
        SetUpdated(atualizadoPor);
    }
}
