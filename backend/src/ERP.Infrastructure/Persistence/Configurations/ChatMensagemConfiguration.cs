using ERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERP.Infrastructure.Persistence.Configurations;

public class ChatMensagemConfiguration : BaseEntityConfiguration<ChatMensagem>
{
    protected override void ConfigureEntity(EntityTypeBuilder<ChatMensagem> builder)
    {
        builder.ToTable("chat_mensagens");

        builder.Property(e => e.SessaoId)
            .IsRequired();

        builder.Property(e => e.Conteudo)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(e => e.Origem)
            .IsRequired();

        builder.Property(e => e.StatusEntrega)
            .IsRequired();

        builder.Property(e => e.TempoRespostaMs)
            .IsRequired(false);

        builder.HasIndex(e => e.SessaoId);
        builder.HasIndex(e => e.StatusEntrega);

        builder.HasOne(e => e.Sessao)
            .WithMany(s => s.Mensagens)
            .HasForeignKey(e => e.SessaoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
