using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public class Funcionario : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string Cpf { get; private set; } = string.Empty;
    public string Cargo { get; private set; } = string.Empty;
    public decimal Salario { get; private set; }
    public DateTime DataAdmissao { get; private set; }
    public Guid? UsuarioId { get; private set; }

    private Funcionario() { }

    public static Funcionario Create(
        string nome,
        string cpf,
        string cargo,
        decimal salario,
        DateTime dataAdmissao,
        Guid? usuarioId,
        string criadoPor)
    {
        var funcionario = new Funcionario
        {
            Nome = nome,
            Cpf = cpf,
            Cargo = cargo,
            Salario = salario,
            DataAdmissao = dataAdmissao,
            UsuarioId = usuarioId
        };
        funcionario.SetCreated(criadoPor);
        return funcionario;
    }

    public void Atualizar(
        string nome,
        string cargo,
        decimal salario,
        string atualizadoPor)
    {
        Nome = nome;
        Cargo = cargo;
        Salario = salario;
        SetUpdated(atualizadoPor);
    }

    public void VincularUsuario(Guid usuarioId, string atualizadoPor)
    {
        UsuarioId = usuarioId;
        SetUpdated(atualizadoPor);
    }
}
