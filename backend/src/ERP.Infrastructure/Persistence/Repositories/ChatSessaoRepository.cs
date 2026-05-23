using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ChatSessaoRepository(AppDbContext context)
    : BaseRepository<ChatSessao>(context), IChatSessaoRepository { }
