using System.Linq.Expressions;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Persistence.Repositories;

public class ContaReceberRepository(AppDbContext context)
    : BaseRepository<ContaReceber>(context), IContaReceberRepository
{
    public override async Task<(IReadOnlyList<ContaReceber> Items, int Total)> GetPagedAsync(
        int page, int pageSize, Expression<Func<ContaReceber, bool>>? filter = null, CancellationToken ct = default)
    {
        var query = DbSet.Include(cr => cr.Cliente).AsQueryable();
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

    public override async Task<IReadOnlyList<ContaReceber>> FindAsync(
        Expression<Func<ContaReceber, bool>> predicate, CancellationToken ct = default)
        => await DbSet.Include(cr => cr.Cliente).Where(predicate).ToListAsync(ct);
}