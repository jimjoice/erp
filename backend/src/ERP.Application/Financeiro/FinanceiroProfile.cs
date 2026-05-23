using AutoMapper;
using ERP.Domain.Entities;

namespace ERP.Application.Financeiro;

public class FinanceiroProfile : Profile
{
    public FinanceiroProfile()
    {
        CreateMap<ContaPagar, ContaPagarResponseDto>()
            .ForMember(d => d.FornecedorRazaoSocial,
                       opt => opt.MapFrom(cp => cp.Fornecedor != null ? cp.Fornecedor.RazaoSocial : null))
            .ForMember(d => d.Status,
                       opt => opt.MapFrom(cp => cp.Status.ToString()));

        CreateMap<LancamentoCaixa, LancamentoCaixaResponseDto>()
            .ForMember(d => d.Tipo, opt => opt.MapFrom(l => l.Tipo.ToString()));

	CreateMap<ContaReceber, ContaReceberResponseDto>()
    .ForMember(d => d.ClienteNome,
               opt => opt.MapFrom(cr => cr.Cliente != null ? cr.Cliente.Nome : null))
    .ForMember(d => d.Status,
               opt => opt.MapFrom(cr => cr.Status.ToString()));
    }
}
