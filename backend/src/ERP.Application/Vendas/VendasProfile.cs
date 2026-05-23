using AutoMapper;
using ERP.Domain.Entities;

namespace ERP.Application.Vendas;

public class VendasProfile : Profile
{
    public VendasProfile()
    {
        CreateMap<Venda, VendaResponseDto>()
            .ForMember(d => d.Status,         opt => opt.MapFrom(v => v.Status.ToString()))
            .ForMember(d => d.ClienteNome,    opt => opt.MapFrom(v => v.Cliente != null ? v.Cliente.Nome : null))
            .ForMember(d => d.FuncionarioNome, opt => opt.MapFrom(v => v.Funcionario != null ? v.Funcionario.Nome : null))
            .ForMember(d => d.Itens,          opt => opt.MapFrom(v => v.Itens))
            .ForMember(d => d.Pagamentos,     opt => opt.MapFrom(v => v.Pagamentos));

        CreateMap<ItemVenda, ItemVendaResponseDto>()
            .ForMember(d => d.ProdutoNome, opt => opt.MapFrom(i => i.Produto != null ? i.Produto.Nome : null));

        CreateMap<Pagamento, PagamentoResponseDto>()
            .ForMember(d => d.Forma, opt => opt.MapFrom(p => p.Forma.ToString()));

        CreateMap<ContaReceber, ContaReceberResponseDto>()
            .ForMember(d => d.FormaPagamento, opt => opt.MapFrom(cr => cr.FormaPagamento.ToString()))
            .ForMember(d => d.Status,         opt => opt.MapFrom(cr => cr.Status.ToString()));
    }
}
