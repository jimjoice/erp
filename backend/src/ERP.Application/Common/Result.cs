namespace ERP.Application.Common;

public class Result<T>
{
    public bool Success { get; private set; }
    public T? Data { get; private set; }
    public string? Error { get; private set; }
    public int StatusCode { get; private set; }

    private Result() { }

    public static Result<T> Ok(T data, int statusCode = 200) =>
        new() { Success = true, Data = data, StatusCode = statusCode };

    public static Result<T> Created(T data) =>
        new() { Success = true, Data = data, StatusCode = 201 };

    public static Result<T> Fail(string error, int statusCode = 400) =>
        new() { Success = false, Error = error, StatusCode = statusCode };

    public static Result<T> NotFound(string error = "Recurso não encontrado") =>
        Fail(error, 404);

    public static Result<T> Unauthorized(string error = "Não autorizado") =>
        Fail(error, 401);

    public static Result<T> Forbidden(string error = "Acesso negado") =>
        Fail(error, 403);

    public static Result<T> Conflict(string error) =>
        Fail(error, 409);
}

public class Result
{
    public bool Success { get; private set; }
    public string? Error { get; private set; }
    public int StatusCode { get; private set; }

    private Result() { }

    public static Result Ok(int statusCode = 200) =>
        new() { Success = true, StatusCode = statusCode };

    public static Result Fail(string error, int statusCode = 400) =>
        new() { Success = false, Error = error, StatusCode = statusCode };

    public static Result NotFound(string error = "Recurso não encontrado") =>
        Fail(error, 404);
}
