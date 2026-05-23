using System.Linq.Expressions;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Persistence.Repositories;

public class MovimentacaoEstoqueRepository(AppDbContext context)
    : BaseRepository<MovimentacaoEstoque>(context), IMovimentacaoEstoqueRepository
{
    public async Task<(IReadOnlyList<MovimentacaoEstoque> Items, int Total)> GetPagedComProdutoAsync(
        int page, int pageSize,
        Expression<Func<MovimentacaoEstoque, bool>>? filter = null,
        CancellationToken ct = default)
    {
        var query = DbSet.Include(m => m.Produto).AsQueryable();
        if (filter is not null)
            query = query.Where(filter);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}
