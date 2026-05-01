namespace Modules.Mail.Options;

public class MailOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string FromAddress { get; set; } = string.Empty;
    public string? FromName { get; set; }
    public int TimeoutMilliseconds { get; set; } = 100000;
    public string[] NotificationRecipients { get; set; } = [];
}
