using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class PagamentoConfiguration : BaseEntityConfiguration<Pagamento>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Pagamento> builder)
    {
        builder.ToTable("pagamentos");

        builder.Property(e => e.VendaId)
            .IsRequired();

        builder.Property(e => e.Forma)
            .IsRequired();

        builder.Property(e => e.Valor)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Parcelas)
            .IsRequired();

        builder.Property(e => e.TaxaJuros)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.HasIndex(e => e.VendaId);
    }
}
