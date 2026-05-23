using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ProdutoConfiguration : BaseEntityConfiguration<Produto>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produtos");

        builder.Property(e => e.Nome)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Sku)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.CodigoBarras)
            .HasMaxLength(50);

        builder.Property(e => e.Ncm)
            .HasMaxLength(8);

        builder.Property(e => e.Descricao)
            .HasMaxLength(1000);

        builder.Property(e => e.PrecoCusto)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.PrecoVenda)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.EstoqueAtual)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.EstoqueMinimo)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.UnidadeMedida)
            .IsRequired();

        // Índices únicos com filtro de soft-delete — permite re-criar produto deletado com mesmo SKU/barras
        builder.HasIndex(e => e.Sku)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(e => e.CodigoBarras)
            .IsUnique()
            .HasFilter("codigo_barras IS NOT NULL AND deleted_at IS NULL");

        // Índices em campos de busca frequente e FK
        builder.HasIndex(e => e.Nome);
        builder.HasIndex(e => e.CategoriaId);

        builder.HasOne(e => e.Categoria)
            .WithMany()
            .HasForeignKey(e => e.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
