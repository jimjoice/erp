using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ContaReceberRepository(AppDbContext context)
    : BaseRepository<ContaReceber>(context), IContaReceberRepository { }
