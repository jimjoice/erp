using System.Reflection;
using ERP.Application.Interfaces;
using ERP.Domain.Common;
using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    // ── Cadastros ──────────────────────────────────────────────────────────────
    public DbSet<Categoria>   Categorias   { get; set; } = null!;
    public DbSet<Produto>     Produtos     { get; set; } = null!;
    public DbSet<Cliente>     Clientes     { get; set; } = null!;
    public DbSet<Fornecedor>  Fornecedores { get; set; } = null!;
    public DbSet<Funcionario> Funcionarios { get; set; } = null!;

    // ── Estoque ────────────────────────────────────────────────────────────────
    public DbSet<MovimentacaoEstoque> MovimentacoesEstoque { get; set; } = null!;

    // ── Usuários ───────────────────────────────────────────────────────────────
    public DbSet<Usuario> Usuarios { get; set; } = null!;

    // ── Vendas ─────────────────────────────────────────────────────────────────
    public DbSet<Venda>     Vendas     { get; set; } = null!;
    public DbSet<ItemVenda> ItensVenda { get; set; } = null!;
    public DbSet<Pagamento> Pagamentos { get; set; } = null!;

    // ── Financeiro ─────────────────────────────────────────────────────────────
    public DbSet<ContaReceber>    ContasReceber    { get; set; } = null!;
    public DbSet<ContaPagar>      ContasPagar      { get; set; } = null!;
    public DbSet<LancamentoCaixa> LancamentosCaixa { get; set; } = null!;

    // ── Chat ───────────────────────────────────────────────────────────────────
    public DbSet<ChatSessao>   ChatSessoes   { get; set; } = null!;
    public DbSet<ChatMensagem> ChatMensagens { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        ApplySoftDeleteFilters(modelBuilder);
    }

    private static void ApplySoftDeleteFilters(ModelBuilder modelBuilder)
    {
        var method = typeof(AppDbContext)
            .GetMethod(nameof(SetSoftDeleteFilter), BindingFlags.NonPublic | BindingFlags.Static)!;

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType) && !entityType.ClrType.IsAbstract)
                method.MakeGenericMethod(entityType.ClrType).Invoke(null, [modelBuilder]);
        }
    }

    private static void SetSoftDeleteFilter<T>(ModelBuilder builder) where T : BaseEntity
        => builder.Entity<T>().HasQueryFilter(e => e.DeletedAt == null);

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await base.SaveChangesAsync(ct);
}
