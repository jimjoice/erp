using ERP.Domain.Common;
using ERP.Domain.ValueObjects;

namespace ERP.Domain.Entities;

public class Fornecedor : BaseEntity
{
    public string RazaoSocial { get; private set; } = string.Empty;
    public string Cnpj { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Telefone { get; private set; }
    public Endereco? Endereco { get; private set; }

    private Fornecedor() { }

    public static Fornecedor Create(
        string razaoSocial,
        string cnpj,
        string? email,
        string? telefone,
        Endereco? endereco,
        string criadoPor)
    {
        var fornecedor = new Fornecedor
        {
            RazaoSocial = razaoSocial,
            Cnpj = cnpj,
            Email = email,
            Telefone = telefone,
            Endereco = endereco
        };
        fornecedor.SetCreated(criadoPor);
        return fornecedor;
    }

    public void Atualizar(
        string razaoSocial,
        string? email,
        string? telefone,
        string atualizadoPor)
    {
        RazaoSocial = razaoSocial;
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
