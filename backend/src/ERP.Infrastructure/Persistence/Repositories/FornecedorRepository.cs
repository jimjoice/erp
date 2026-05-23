using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class FornecedorRepository(AppDbContext context)
    : BaseRepository<Fornecedor>(context), IFornecedorRepository { }
