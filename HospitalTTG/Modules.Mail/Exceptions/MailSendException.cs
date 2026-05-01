using Shared.Abstractions.Exceptions;

namespace Modules.Mail.Exceptions;

public class MailSendException : BaseException
{
    public MailSendException(string message)
        : base(message, 502)
    {
    }
}
