using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ContaPagarConfiguration : BaseEntityConfiguration<ContaPagar>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ContaPagar> builder)
    {
        builder.ToTable("contas_pagar");

        builder.Property(e => e.FornecedorId)
            .IsRequired();

        builder.Property(e => e.Descricao)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.Valor)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.DataVencimento)
            .IsRequired();

        builder.Property(e => e.DataPagamento)
            .IsRequired(false);

        builder.Property(e => e.Status)
            .IsRequired();

        builder.HasIndex(e => e.FornecedorId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DataVencimento);

        builder.HasOne(e => e.Fornecedor)
            .WithMany()
            .HasForeignKey(e => e.FornecedorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
