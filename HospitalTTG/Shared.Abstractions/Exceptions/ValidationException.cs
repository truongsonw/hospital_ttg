namespace Shared.Abstractions.Exceptions;

public class ValidationException : BaseException
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.", 400)
    {
        Errors = errors;
    }
}
