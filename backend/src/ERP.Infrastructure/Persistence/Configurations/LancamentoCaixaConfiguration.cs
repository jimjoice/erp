using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class LancamentoCaixaConfiguration : BaseEntityConfiguration<LancamentoCaixa>
{
    protected override void ConfigureEntity(EntityTypeBuilder<LancamentoCaixa> builder)
    {
        builder.ToTable("lancamentos_caixa");

        builder.Property(e => e.Tipo)
            .IsRequired();

        builder.Property(e => e.Valor)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.Descricao)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.ContaReceberId)
            .IsRequired(false);

        builder.Property(e => e.ContaPagarId)
            .IsRequired(false);

        builder.HasIndex(e => e.Tipo);
        builder.HasIndex(e => e.ContaReceberId);
        builder.HasIndex(e => e.ContaPagarId);

        builder.HasOne(e => e.ContaReceber)
            .WithMany()
            .HasForeignKey(e => e.ContaReceberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.ContaPagar)
            .WithMany()
            .HasForeignKey(e => e.ContaPagarId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
