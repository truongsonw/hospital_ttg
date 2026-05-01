using System.Net;
using System.Net.Mail;
using Contracts.Mail.DTOs;
using Contracts.Mail.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Modules.Mail.Exceptions;
using Modules.Mail.Options;

namespace Modules.Mail.Services;

public class SmtpMailSender : IMailSender
{
    private readonly MailOptions _options;
    private readonly ILogger<SmtpMailSender> _logger;

    public SmtpMailSender(IOptions<MailOptions> options, ILogger<SmtpMailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(SendMailRequest request, CancellationToken ct = default)
    {
        ValidateOptions();

        using var message = new MailMessage
        {
            From = CreateAddress(_options.FromAddress, _options.FromName),
            Subject = request.Subject.Trim(),
            Body = request.Body.Trim(),
            IsBodyHtml = request.IsBodyHtml
        };

        message.To.Add(CreateAddress(request.To, request.ToName));

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
            Timeout = _options.TimeoutMilliseconds,
            UseDefaultCredentials = false
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password ?? string.Empty);
        }

        try
        {
            await client.SendMailAsync(message, ct);
            _logger.LogInformation("Sent email to {Recipient}", request.To);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", request.To);
            throw new MailSendException("Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau.");
        }
    }

    public async Task SendSystemNotificationAsync(string subject, string body, CancellationToken ct = default)
    {
        var recipients = _options.NotificationRecipients
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (recipients.Count == 0)
        {
            _logger.LogWarning("Mail notification skipped because Mail:NotificationRecipients is empty.");
            return;
        }

        foreach (var recipient in recipients)
        {
            await SendAsync(new SendMailRequest
            {
                To = recipient,
                Subject = subject,
                Body = body
            }, ct);
        }
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
            throw new MailSendException("Chưa cấu hình SMTP host.");

        if (_options.Port is < 1 or > 65535)
            throw new MailSendException("Cổng SMTP không hợp lệ.");

        if (string.IsNullOrWhiteSpace(_options.FromAddress))
            throw new MailSendException("Chưa cấu hình địa chỉ email gửi.");

        _ = CreateAddress(_options.FromAddress, _options.FromName);
    }

    private static MailAddress CreateAddress(string address, string? displayName)
    {
        return string.IsNullOrWhiteSpace(displayName)
            ? new MailAddress(address)
            : new MailAddress(address, displayName);
    }
}
