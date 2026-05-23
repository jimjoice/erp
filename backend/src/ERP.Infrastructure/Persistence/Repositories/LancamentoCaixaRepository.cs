using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Infrastructure.Persistence.Repositories;

public class LancamentoCaixaRepository(AppDbContext context)
    : BaseRepository<LancamentoCaixa>(context), ILancamentoCaixaRepository { }
