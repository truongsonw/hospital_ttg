namespace Shared.Abstractions.Exceptions;

public class NotFoundException : BaseException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with key '{key}' was not found.", 404)
    {
    }
}
