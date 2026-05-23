using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ClienteConfiguration : BaseEntityConfiguration<Cliente>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");

        builder.Property(e => e.Nome)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.TipoPessoa)
            .IsRequired();

        builder.Property(e => e.CpfCnpj)
            .HasMaxLength(14)
            .IsRequired();

        builder.Property(e => e.Email)
            .HasMaxLength(200);

        builder.Property(e => e.Telefone)
            .HasMaxLength(20);

        // Índice único com filtro: clientes deletados não bloqueiam re-cadastro
        builder.HasIndex(e => e.CpfCnpj)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(e => e.Nome);

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
