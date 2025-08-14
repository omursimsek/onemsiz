namespace Backend.Application.Common;

public class Result
{
    public bool Success { get; init; }
    public string? Error { get; init; }
    public int? StatusCode { get; init; }

    public static Result Ok() => new() { Success = true };
    public static Result Fail(string error, int? statusCode = null) =>
        new() { Success = false, Error = error, StatusCode = statusCode };
}

public class Result<T> : Result
{
    public T? Value { get; init; }

    public static Result<T> Ok(T value) =>
        new() { Success = true, Value = value };

    public static new Result<T> Fail(string error, int? statusCode = null) =>
        new() { Success = false, Error = error, StatusCode = statusCode };

    public static Result<T> FailFrom(Result baseResult) =>
        new() { Success = false, Error = baseResult.Error, StatusCode = baseResult.StatusCode };
}
