using AutoMapper;
using ERP.Domain.Entities;

namespace ERP.Application.Chat;

public class ChatProfile : Profile
{
    public ChatProfile()
    {
        CreateMap<ChatSessao, ChatSessaoDto>()
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<ChatMensagem, ChatMensagemDto>()
            .ForMember(d => d.Origem,        opt => opt.MapFrom(m => m.Origem.ToString()))
            .ForMember(d => d.StatusEntrega, opt => opt.MapFrom(m => m.StatusEntrega.ToString()));
    }
}
