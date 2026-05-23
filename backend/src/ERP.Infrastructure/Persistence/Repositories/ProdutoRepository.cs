using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ProdutoRepository(AppDbContext context)
    : BaseRepository<Produto>(context), IProdutoRepository { }
