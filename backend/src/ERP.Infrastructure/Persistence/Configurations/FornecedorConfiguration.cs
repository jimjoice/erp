using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class FornecedorConfiguration : BaseEntityConfiguration<Fornecedor>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Fornecedor> builder)
    {
        builder.ToTable("fornecedores");

        builder.Property(e => e.RazaoSocial)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Cnpj)
            .HasMaxLength(14)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasMaxLength(200);

        builder.Property(e => e.Telefone)
            .HasMaxLength(20);

        builder.HasIndex(e => e.Cnpj)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(e => e.RazaoSocial);

        builder.OwnsOne(e => e.Endereco, endereco =>
        {
            endereco.Property(e => e.Cep).HasMaxLength(8);
            endereco.Property(e => e.Logradouro).HasMaxLength(200);
            endereco.Property(e => e.Numero).HasMaxLength(20);
            endereco.Property(e => e.Complemento).HasMaxLength(100);
            endereco.Property(e => e.Bairro).HasMaxLength(100);
            endereco.Property(e => e.Cidade).HasMaxLength(100);
            endereco.Property(e => e.Uf).HasMaxLength(2);
        });
    }
}
