namespace Shared.Abstractions.Exceptions;

public abstract class BaseException : Exception
{
    public int StatusCode { get; }

    protected BaseException(string message, int statusCode = 500)
        : base(message)
    {
        StatusCode = statusCode;
    }
}
