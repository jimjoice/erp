using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class MovimentacaoEstoqueConfiguration : BaseEntityConfiguration<MovimentacaoEstoque>
{
    protected override void ConfigureEntity(EntityTypeBuilder<MovimentacaoEstoque> builder)
    {
        builder.ToTable("movimentacoes_estoque");

        builder.Property(e => e.Tipo)
            .IsRequired();

        builder.Property(e => e.Quantidade)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.QuantidadeAnterior)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.QuantidadeResultante)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(e => e.MotivoCodigo)
            .IsRequired();

        builder.Property(e => e.Descricao)
            .HasMaxLength(500);

        builder.Property(e => e.DocumentoOrigem)
            .HasMaxLength(100);

        builder.HasOne(e => e.Produto)
            .WithMany()
            .HasForeignKey(e => e.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => e.ProdutoId);
        builder.HasIndex(e => e.CreatedAt);
    }
}
