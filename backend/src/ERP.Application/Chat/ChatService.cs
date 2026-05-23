using System.Diagnostics;
using AutoMapper;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Chat;

public class ChatService(
    IRepository<ChatSessao> sessaoRepository,
    IRepository<ChatMensagem> mensagemRepository,
    IUnitOfWork unitOfWork,
    IN8nWebhookClient n8nClient,
    IMapper mapper) : IChatService
{
    public async Task<Result<ChatSessaoDto>> ObterOuCriarSessaoAsync(
        Guid usuarioId, CancellationToken ct = default)
    {
        var sessao = await ObterSessaoAtivaAsync(usuarioId, ct);

        if (sessao is null)
        {
            sessao = ChatSessao.Create(usuarioId, usuarioId.ToString());
            await sessaoRepository.AddAsync(sessao, ct);
            await unitOfWork.SaveChangesAsync(ct);
        }

        return Result<ChatSessaoDto>.Ok(mapper.Map<ChatSessaoDto>(sessao));
    }

    public async Task<Result<List<ChatMensagemDto>>> ObterHistoricoAsync(
        Guid sessaoId, CancellationToken ct = default)
    {
        var mensagens = await mensagemRepository.FindAsync(m => m.SessaoId == sessaoId, ct);

        var historico = mensagens
            .OrderBy(m => m.CreatedAt)
            .Select(m => mapper.Map<ChatMensagemDto>(m))
            .ToList();

        return Result<List<ChatMensagemDto>>.Ok(historico);
    }

    public async Task<Result<ChatMensagemDto>> EnviarMensagemAsync(
        Guid usuarioId, string conteudo, CancellationToken ct = default)
    {
        var criadoPor = usuarioId.ToString();

        // Garante sessão ativa
        var sessao = await ObterSessaoAtivaAsync(usuarioId, ct);
        if (sessao is null)
        {
            sessao = ChatSessao.Create(usuarioId, criadoPor);
            await sessaoRepository.AddAsync(sessao, ct);
            await unitOfWork.SaveChangesAsync(ct);
        }

        // Persiste mensagem do usuário como Enviada
        var mensagemUsuario = ChatMensagem.Create(sessao.Id, conteudo, OrigemMensagem.Usuario, criadoPor);
        await mensagemRepository.AddAsync(mensagemUsuario, ct);
        sessao.IncrementarTotalMensagens(criadoPor);
        await unitOfWork.SaveChangesAsync(ct);

        // Atualiza para Processando antes de chamar o n8n
        mensagemUsuario.MarcarComoProcessando(criadoPor);
        await unitOfWork.SaveChangesAsync(ct);

        // Chama o n8n com timeout de 30 segundos
        var sw = Stopwatch.StartNew();
        var respostaTexto = string.Empty;
        var sucesso = false;

        try
        {
            using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeoutCts.CancelAfter(TimeSpan.FromSeconds(30));

            respostaTexto = await n8nClient.EnviarMensagemAsync(
                conteudo, usuarioId, sessao.Id, timeoutCts.Token);

            sucesso = true;
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            // Requisição cancelada pelo cliente — propaga sem salvar resposta parcial
            throw;
        }
        catch (OperationCanceledException)
        {
            respostaTexto = "O agente não respondeu no tempo limite. Tente novamente.";
        }
        catch (Exception)
        {
            respostaTexto = "Ocorreu um erro ao processar sua mensagem. Tente novamente.";
        }
        finally
        {
            sw.Stop();
        }

        // Constrói e persiste mensagem do agente
        var mensagemAgente = ChatMensagem.Create(sessao.Id, respostaTexto, OrigemMensagem.Agente, criadoPor);

        if (sucesso)
        {
            mensagemAgente.MarcarComoEntregue((int)sw.ElapsedMilliseconds, criadoPor);
        }
        else
        {
            mensagemUsuario.MarcarComoErro(criadoPor);
            mensagemAgente.MarcarComoErro(criadoPor);
        }

        await mensagemRepository.AddAsync(mensagemAgente, ct);
        sessao.IncrementarTotalMensagens(criadoPor);
        await unitOfWork.SaveChangesAsync(ct);

        return Result<ChatMensagemDto>.Ok(mapper.Map<ChatMensagemDto>(mensagemAgente));
    }

    public async Task<Result> EncerrarSessaoAsync(Guid usuarioId, CancellationToken ct = default)
    {
        var sessao = await ObterSessaoAtivaAsync(usuarioId, ct);

        if (sessao is not null)
        {
            sessao.Encerrar(usuarioId.ToString());
            await unitOfWork.SaveChangesAsync(ct);
        }

        return Result.Ok(204);
    }

    private async Task<ChatSessao?> ObterSessaoAtivaAsync(Guid usuarioId, CancellationToken ct)
    {
        var sessoes = await sessaoRepository.FindAsync(
            s => s.UsuarioId == usuarioId && s.Status == StatusSessaoChat.Ativa, ct);

        return sessoes.FirstOrDefault();
    }
}
