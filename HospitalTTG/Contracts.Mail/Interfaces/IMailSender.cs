using Contracts.Mail.DTOs;

namespace Contracts.Mail.Interfaces;

public interface IMailSender
{
    Task SendAsync(SendMailRequest request, CancellationToken ct = default);
    Task SendSystemNotificationAsync(string subject, string body, CancellationToken ct = default);
}
