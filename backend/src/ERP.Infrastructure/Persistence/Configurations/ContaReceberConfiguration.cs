using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ContaReceberConfiguration : BaseEntityConfiguration<ContaReceber>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ContaReceber> builder)
    {
        builder.ToTable("contas_receber");

        builder.Property(e => e.VendaId)
            .IsRequired(false);

        builder.Property(e => e.ClienteId)
            .IsRequired(false);

        builder.Property(e => e.FormaPagamento)
            .IsRequired();

        builder.Property(e => e.Descricao)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.Valor)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.NumeroParcela)
            .IsRequired();

        builder.Property(e => e.TotalParcelas)
            .IsRequired();

        builder.Property(e => e.DataVencimento)
            .IsRequired();

        builder.Property(e => e.DataPagamento)
            .IsRequired(false);

        builder.Property(e => e.Status)
            .IsRequired();

        builder.HasIndex(e => e.VendaId);
        builder.HasIndex(e => e.ClienteId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DataVencimento);

        builder.HasOne(e => e.Venda)
            .WithMany()
            .HasForeignKey(e => e.VendaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Cliente)
            .WithMany()
            .HasForeignKey(e => e.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
