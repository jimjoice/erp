using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedFuncionarioTelefoneEmail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.Sql(@"
        UPDATE funcionarios SET telefone = '(11) 91111-0001', email = 'carlos@smartsteps.com'   WHERE id = 'e1000000-0000-0000-0000-000000000001';
        UPDATE funcionarios SET telefone = '(11) 91111-0002', email = 'fernanda@smartsteps.com' WHERE id = 'e1000000-0000-0000-0000-000000000002';
        UPDATE funcionarios SET telefone = '(11) 91111-0003', email = 'roberto@smartsteps.com'  WHERE id = 'e1000000-0000-0000-0000-000000000003';
        UPDATE funcionarios SET telefone = '(11) 91111-0004', email = 'juliana@smartsteps.com'  WHERE id = 'e1000000-0000-0000-0000-000000000004';
        UPDATE funcionarios SET telefone = '(11) 91111-0005', email = 'marcos@smartsteps.com'   WHERE id = 'e1000000-0000-0000-0000-000000000005';
    ");
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
