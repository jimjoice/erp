using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : BaseEntityConfiguration<Usuario>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");

        builder.Property(e => e.Nome)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.SenhaHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.Perfil)
            .IsRequired();

        builder.Property(e => e.Ativo)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");
    }
}
