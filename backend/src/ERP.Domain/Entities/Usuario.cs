using ERP.Domain.Common;
using ERP.Domain.Enums;

namespace ERP.Domain.Entities;

public class Usuario : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public PerfilUsuario Perfil { get; private set; }
    public bool Ativo { get; private set; }

    private Usuario() { }

    public static Usuario Create(
        string nome,
        string email,
        string senhaHash,
        PerfilUsuario perfil,
        string criadoPor)
    {
        var usuario = new Usuario
        {
            Nome      = nome,
            Email     = email.ToLower().Trim(),
            SenhaHash = senhaHash,
            Perfil    = perfil,
            Ativo     = true
        };
        usuario.SetCreated(criadoPor);
        return usuario;
    }

    public void Desativar(string atualizadoPor)
    {
        Ativo = false;
        SetUpdated(atualizadoPor);
    }

    public void Ativar(string atualizadoPor)
    {
        Ativo = true;
        SetUpdated(atualizadoPor);
    }

    public void AlterarSenha(string novaSenhaHash, string atualizadoPor)
    {
        SenhaHash = novaSenhaHash;
        SetUpdated(atualizadoPor);
    }

    public void AlterarPerfil(PerfilUsuario novoPerfil, string atualizadoPor)
    {
        Perfil = novoPerfil;
        SetUpdated(atualizadoPor);
    }
}
