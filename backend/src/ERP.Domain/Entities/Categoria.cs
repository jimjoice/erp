using ERP.Domain.Common;

namespace ERP.Domain.Entities;

public class Categoria : BaseEntity
{
    public string Nome { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }

    private Categoria() { }

    public static Categoria Create(string nome, string? descricao, string criadoPor)
    {
        var categoria = new Categoria
        {
            Nome = nome,
            Descricao = descricao
        };
        categoria.SetCreated(criadoPor);
        return categoria;
    }

    public void Atualizar(string nome, string? descricao, string atualizadoPor)
    {
        Nome = nome;
        Descricao = descricao;
        SetUpdated(atualizadoPor);
    }
}
