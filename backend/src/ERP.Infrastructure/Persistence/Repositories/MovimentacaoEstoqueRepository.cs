using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class MovimentacaoEstoqueRepository(AppDbContext context)
    : BaseRepository<MovimentacaoEstoque>(context), IMovimentacaoEstoqueRepository { }
