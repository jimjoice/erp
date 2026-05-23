using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class FuncionarioConfiguration : BaseEntityConfiguration<Funcionario>
{
    protected override void ConfigureEntity(EntityTypeBuilder<Funcionario> builder)
    {
        builder.ToTable("funcionarios");

        builder.Property(e => e.Nome)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Cpf)
            .HasMaxLength(11)
            .IsRequired();

        builder.Property(e => e.Cargo)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Salario)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(e => e.DataAdmissao)
            .IsRequired();

        builder.HasIndex(e => e.Cpf)
            .IsUnique()
            .HasFilter("deleted_at IS NULL");

        builder.HasIndex(e => e.Nome);

        // Índice na FK para futuro join com tabela de usuários
        builder.HasIndex(e => e.UsuarioId)
            .HasFilter("usuario_id IS NOT NULL");
    }
}
