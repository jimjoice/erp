using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ChatMensagemRepository(AppDbContext context)
    : BaseRepository<ChatMensagem>(context), IChatMensagemRepository { }
