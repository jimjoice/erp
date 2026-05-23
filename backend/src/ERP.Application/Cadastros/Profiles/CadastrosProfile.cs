using AutoMapper;
using ERP.Application.Cadastros.Categorias;
using ERP.Application.Cadastros.Clientes;
using ERP.Application.Cadastros.Common;
using ERP.Application.Cadastros.Fornecedores;
using ERP.Application.Cadastros.Funcionarios;
using ERP.Application.Cadastros.Produtos;
using ERP.Domain.Entities;
using ERP.Domain.ValueObjects;
using ERP.Domain.Enums;

namespace ERP.Application.Cadastros.Profiles;

public class CadastrosProfile : Profile
{
    public CadastrosProfile()
    {
        CreateMap<Categoria, CategoriaResponseDto>();

        CreateMap<Produto, ProdutoResponseDto>()
            .ForMember(d => d.UnidadeMedida,     o => o.MapFrom(s => s.UnidadeMedida.ToString()))
            .ForMember(d => d.CategoriaNome,     o => o.MapFrom(s => s.Categoria != null ? s.Categoria.Nome : null))
            .ForMember(d => d.EstoqueAbaixoDoMinimo, o => o.MapFrom(s => s.EstoqueAbaixoDoMinimo));

        CreateMap<Endereco, EnderecoDto>().ReverseMap();

        CreateMap<Cliente, ClienteResponseDto>()
            .ForMember(d => d.TipoPessoa, o => o.MapFrom(s => s.TipoPessoa.ToString()));

        CreateMap<Fornecedor, FornecedorResponseDto>();

        CreateMap<Funcionario, FuncionarioResponseDto>();

        CreateMap<MovimentacaoEstoque, MovimentacaoEstoqueResponseDto>()
            .ForMember(d => d.Tipo,         o => o.MapFrom(s => s.Tipo.ToString()))
            .ForMember(d => d.MotivoCodigo, o => o.MapFrom(s => s.MotivoCodigo.ToString()))
            .ForMember(d => d.ProdutoNome,  o => o.MapFrom(s => s.Produto != null ? s.Produto.Nome : null));
    }
}
