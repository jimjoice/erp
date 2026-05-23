using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ClienteRepository(AppDbContext context)
    : BaseRepository<Cliente>(context), IClienteRepository { }
