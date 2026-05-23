using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class VendaConfiguration : BaseEntityConfiguration<Venda>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Venda> builder)
    {
        builder.ToTable("vendas");

        builder.Property(e => e.Numero)
            .IsRequired()
            .ValueGeneratedOnAdd();

        builder.HasIndex(e => e.Numero).IsUnique();

        builder.Property(e => e.ClienteId)
            .IsRequired(false);

        builder.Property(e => e.FuncionarioId)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired();

        builder.Property(e => e.DataVenda)
            .IsRequired();

        builder.Property(e => e.Subtotal)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Desconto)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Total)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Observacao)
            .HasMaxLength(500);

        builder.HasIndex(e => e.ClienteId);
        builder.HasIndex(e => e.FuncionarioId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DataVenda);

        builder.HasOne(e => e.Cliente)
            .WithMany()
            .HasForeignKey(e => e.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Funcionario)
            .WithMany()
            .HasForeignKey(e => e.FuncionarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Itens)
            .WithOne(i => i.Venda)
            .HasForeignKey(i => i.VendaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Pagamentos)
            .WithOne(p => p.Venda)
            .HasForeignKey(p => p.VendaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
