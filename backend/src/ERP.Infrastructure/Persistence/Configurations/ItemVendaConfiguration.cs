using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ItemVendaConfiguration : BaseEntityConfiguration<ItemVenda>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ItemVenda> builder)
    {
        builder.ToTable("itens_venda");

        builder.Property(e => e.VendaId)
            .IsRequired();

        builder.Property(e => e.ProdutoId)
            .IsRequired();

        builder.Property(e => e.Quantidade)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.PrecoUnitario)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Desconto)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Subtotal)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.HasIndex(e => e.VendaId);
        builder.HasIndex(e => e.ProdutoId);

        builder.HasOne(e => e.Produto)
            .WithMany()
            .HasForeignKey(e => e.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
