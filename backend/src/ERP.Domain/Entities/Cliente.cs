using ERP.Domain.Common;
using ERP.Domain.Enums;
using ERP.Domain.ValueObjects;

namespace ERP.Domain.Entities;

public class Cliente : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public TipoPessoa TipoPessoa { get; private set; }
    public string CpfCnpj { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Telefone { get; private set; }
    public Endereco? Endereco { get; private set; }

    private Cliente() { }

    public static Cliente Create(
        string nome,
        TipoPessoa tipoPessoa,
        string cpfCnpj,
        string? email,
        string? telefone,
        Endereco? endereco,
        string criadoPor)
    {
        var cliente = new Cliente
        {
            Nome = nome,
            TipoPessoa = tipoPessoa,
            CpfCnpj = cpfCnpj,
            Email = email,
            Telefone = telefone,
            Endereco = endereco
        };
        cliente.SetCreated(criadoPor);
        return cliente;
    }

    public void Atualizar(
        string nome,
        string? email,
        string? telefone,
        string atualizadoPor)
    {
        Nome = nome;
        Email = email;
        Telefone = telefone;
        SetUpdated(atualizadoPor);
    }

    public void AtualizarEndereco(Endereco? endereco, string atualizadoPor)
    {
        Endereco = endereco;
        SetUpdated(atualizadoPor);
    }
}
