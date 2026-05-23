using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class CategoriaConfiguration : BaseEntityConfiguration<Categoria>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Categoria> builder)
    {
        builder.ToTable("categorias");

        builder.Property(e => e.Nome)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Descricao)
            .HasMaxLength(500);

        builder.HasIndex(e => e.Nome)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");
    }
}
