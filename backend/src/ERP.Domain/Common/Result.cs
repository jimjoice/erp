namespace ERP.Domain.Common;

public sealed class Result<T>
{
    public T? Value { get; }
    public bool IsSuccess { get; }
    public string? Error { get; }
    public IReadOnlyList<ValidationError> ValidationErrors { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        ValidationErrors = [];
    }

    private Result(string error)
    {
        IsSuccess = false;
        Error = error;
        ValidationErrors = [];
    }

    private Result(IReadOnlyList<ValidationError> validationErrors)
    {
        IsSuccess = false;
        ValidationErrors = validationErrors;
        Error = "Validation failed.";
    }

    public bool IsFailure => !IsSuccess;
    public bool HasValidationErrors => ValidationErrors.Count > 0;

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
    public static Result<T> ValidationFailure(IReadOnlyList<ValidationError> errors) => new(errors);

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Result<T>, TResult> onFailure)
        => IsSuccess ? onSuccess(Value!) : onFailure(this);
}

public sealed record ValidationError(string Field, string Message);
