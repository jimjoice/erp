using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ContaPagarRepository(AppDbContext context)
    : BaseRepository<ContaPagar>(context), IContaPagarRepository
{
    public override async Task<(IReadOnlyList<ContaPagar> Items, int Total)> GetPagedAsync(
        int page, int pageSize,
        Expression<Func<ContaPagar, bool>>? filter = null,
        CancellationToken ct = default)
    {
        var query = Context.Set<ContaPagar>()
            .Include(cp => cp.Fornecedor)
            .AsQueryable();

        if (filter != null)
            query = query.Where(filter);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(cp => cp.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}