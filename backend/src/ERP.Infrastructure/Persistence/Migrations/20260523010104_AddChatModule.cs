using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChatModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chat_sessoes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    total_mensagens = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_sessoes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_mensagens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    sessao_id = table.Column<Guid>(type: "uuid", nullable: false),
                    conteudo = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    origem = table.Column<int>(type: "integer", nullable: false),
                    status_entrega = table.Column<int>(type: "integer", nullable: false),
                    tempo_resposta_ms = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    updated_by = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chat_mensagens", x => x.id);
                    table.ForeignKey(
                        name: "fk_chat_mensagens_chat_sessoes_sessao_id",
                        column: x => x.sessao_id,
                        principalTable: "chat_sessoes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_chat_mensagens_deleted_at",
                table: "chat_mensagens",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_chat_mensagens_sessao_id",
                table: "chat_mensagens",
                column: "sessao_id");

            migrationBuilder.CreateIndex(
                name: "ix_chat_mensagens_status_entrega",
                table: "chat_mensagens",
                column: "status_entrega");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessoes_deleted_at",
                table: "chat_sessoes",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessoes_status",
                table: "chat_sessoes",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_chat_sessoes_usuario_id",
                table: "chat_sessoes",
                column: "usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_mensagens");

            migrationBuilder.DropTable(
                name: "chat_sessoes");
        }
    }
}
