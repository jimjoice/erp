using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ERP.API.Swagger;

/// <summary>
/// Adiciona o ícone de cadeado JWT nos endpoints que usam RequireAuthorization().
/// OpenApiReference foi removido no Microsoft.OpenApi 2.x — o scheme é referenciado
/// pelas mesmas propriedades definidas em AddSecurityDefinition("Bearer", ...).
/// </summary>
public class BearerSecurityOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var metadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;

        var hasAuthorize = metadata.OfType<IAuthorizeData>().Any();
        var hasAllowAnonymous = metadata.OfType<IAllowAnonymous>().Any();

        if (!hasAuthorize || hasAllowAnonymous)
            return;

        operation.Security ??= [];
        // Microsoft.OpenApi 2.x substituiu OpenApiSecurityScheme (com Reference)
        // por OpenApiSecuritySchemeReference como chave de OpenApiSecurityRequirement
        operation.Security.Add(new OpenApiSecurityRequirement
        {
            { new OpenApiSecuritySchemeReference("Bearer"), [] }
        });
    }
}
