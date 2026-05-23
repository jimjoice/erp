using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ChatSessaoConfiguration : BaseEntityConfiguration<ChatSessao>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ChatSessao> builder)
    {
        builder.ToTable("chat_sessoes");

        builder.Property(e => e.UsuarioId)
            .IsRequired();

        builder.Property(e => e.Titulo)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Status)
            .IsRequired();

        builder.Property(e => e.TotalMensagens)
            .IsRequired();

        builder.HasIndex(e => e.UsuarioId);
        builder.HasIndex(e => e.Status);
    }
}
