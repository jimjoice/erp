using ERP.Domain.Entities;
using ERP.Domain.Enums;

namespace ERP.Application.Interfaces;

public interface IVendaRepository : IRepository<Venda>
{
    /// <summary>
    /// Carrega venda com Itens, Pagamentos, Cliente e Funcionario via eager loading.
    /// </summary>
    Task<Venda?> GetByIdComItensAsync(Guid id, CancellationToken ct = default);

    Task<(IReadOnlyList<Venda> Items, int Total)> GetPagedComFiltroAsync(
        int page,
        int pageSize,
        StatusVenda? status = null,
        Guid? clienteId = null,
        Guid? funcionarioId = null,
        DateTime? dataInicio = null,
        DateTime? dataFim = null,
        CancellationToken ct = default);

    /// <summary>
    /// Retorna total vendido e quantidade de vendas confirmadas na data informada (UTC).
    /// </summary>
    Task<(decimal TotalVendido, int QuantidadeVendas)> GetResumoDiaAsync(
        DateTime data, CancellationToken ct = default);
}
