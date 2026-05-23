using System.Linq.Expressions;
using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Interfaces;

public interface IMovimentacaoEstoqueRepository : IRepository<MovimentacaoEstoque>
{
    Task<(IReadOnlyList<MovimentacaoEstoque> Items, int Total)> GetPagedComProdutoAsync(
        int page, int pageSize,
        Expression<Func<MovimentacaoEstoque, bool>>? filter = null,
        CancellationToken ct = default);
}
