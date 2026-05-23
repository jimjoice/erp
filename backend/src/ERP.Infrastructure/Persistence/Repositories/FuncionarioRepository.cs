using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class FuncionarioRepository(AppDbContext context)
    : BaseRepository<Funcionario>(context), IFuncionarioRepository { }
