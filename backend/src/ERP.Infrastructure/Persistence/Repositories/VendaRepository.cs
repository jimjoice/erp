using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Persistence.Repositories;

public class VendaRepository(AppDbContext context)
    : BaseRepository<Venda>(context), IVendaRepository
{
    public async Task<Venda?> GetByIdComItensAsync(Guid id, CancellationToken ct = default)
        => await DbSet
            .Include(v => v.Itens)
            .Include(v => v.Pagamentos)
            .Include(v => v.Cliente)
            .Include(v => v.Funcionario)
            .FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<(IReadOnlyList<Venda> Items, int Total)> GetPagedComFiltroAsync(
        int page,
        int pageSize,
        StatusVenda? status = null,
        Guid? clienteId = null,
        Guid? funcionarioId = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default)
    {
        var query = DbSet
            .Include(v => v.Cliente)
            .Include(v => v.Funcionario)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(v => v.Status == status.Value);
        if (clienteId.HasValue)
            query = query.Where(v => v.ClienteId == clienteId.Value);
        if (funcionarioId.HasValue)
            query = query.Where(v => v.FuncionarioId == funcionarioId.Value);
        if (dataInicio.HasValue)
            query = query.Where(v => v.DataVenda >= dataInicio.Value);
        if (dataFim.HasValue)
            query = query.Where(v => v.DataVenda <= dataFim.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(v => v.DataVenda)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<(decimal TotalVendido, int QuantidadeVendas)> GetResumoDiaAsync(
        DateTime data, CancellationToken ct = default)
    {
        var inicio = data.Date;
        var fim    = inicio.AddDays(1);

        var totais = await DbSet
            .Where(v => v.Status == StatusVenda.Confirmada &&
                        v.DataVenda >= inicio &&
                        v.DataVenda < fim)
            .Select(v => v.Total)
            .ToListAsync(ct);

        return (totais.Sum(), totais.Count);
    }
}
