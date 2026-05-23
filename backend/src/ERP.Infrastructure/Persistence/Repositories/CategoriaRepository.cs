using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class CategoriaRepository(AppDbContext context)
    : BaseRepository<Categoria>(context), ICategoriaRepository { }
