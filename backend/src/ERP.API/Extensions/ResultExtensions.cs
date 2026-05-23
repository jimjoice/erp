using ERP.Application.Common;

namespace ERP.API.Extensions;

internal static class ResultExtensions
{
    internal static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.Success)
            return Results.Ok(result.Data);

        return Results.Problem(
            detail:     result.Error,
            statusCode: result.StatusCode,
            title:      HttpTitle(result.StatusCode));
    }

    internal static IResult ToHttpResult(this Result result)
    {
        if (result.Success)
            return result.StatusCode == 204 ? Results.NoContent() : Results.Ok();

        return Results.Problem(
            detail:     result.Error,
            statusCode: result.StatusCode,
            title:      HttpTitle(result.StatusCode));
    }

    private static string HttpTitle(int statusCode) => statusCode switch
    {
        400 => "Requisição inválida",
        401 => "Não autenticado",
        403 => "Acesso negado",
        404 => "Recurso não encontrado",
        409 => "Conflito",
        _   => "Erro"
    };
}
