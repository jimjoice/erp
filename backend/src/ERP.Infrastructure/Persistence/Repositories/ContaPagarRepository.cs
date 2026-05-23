using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ContaPagarRepository(AppDbContext context)
    : BaseRepository<ContaPagar>(context), IContaPagarRepository { }
