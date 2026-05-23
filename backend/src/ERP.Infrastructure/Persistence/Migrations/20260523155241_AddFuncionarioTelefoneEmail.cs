using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFuncionarioTelefoneEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "funcionarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "telefone",
                table: "funcionarios",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "email",
                table: "funcionarios");

            migrationBuilder.DropColumn(
                name: "telefone",
                table: "funcionarios");
        }
    }
}
