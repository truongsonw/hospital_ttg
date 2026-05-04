using System.Data;
using System.Data.Common;
using Contracts.Booking.Enums;
using Contracts.Contact.Enums;
using Contracts.System.DTOs;
using Contracts.System.Interfaces;
using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Data;

namespace Modules.System.Services;

public class DashboardStatsService : IDashboardStatsService
{
    private readonly AppDbContext _dbContext;

    public DashboardStatsService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardStatsDto> GetAsync(CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);

        var contents = await ReadSingleRowAsync(
            """
            SELECT
                COUNT(1) AS Total,
                COALESCE(SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END), 0) AS Published,
                COALESCE(SUM(CASE WHEN Status <> 1 THEN 1 ELSE 0 END), 0) AS Draft,
                COALESCE(SUM(CASE WHEN IsHot = 1 AND Status = 1 THEN 1 ELSE 0 END), 0) AS Hot,
                COALESCE(SUM(CASE WHEN CreatedAt >= @Cutoff THEN 1 ELSE 0 END), 0) AS NewLast7Days
            FROM dbo.Contents;
            """,
            command => AddParameter(command, "@Cutoff", cutoff),
            reader => new ContentDashboardStatsDto
            {
                Total = reader.GetInt32(0),
                Published = reader.GetInt32(1),
                Draft = reader.GetInt32(2),
                Hot = reader.GetInt32(3),
                NewLast7Days = reader.GetInt32(4)
            },
            ct);

        var bookings = await ReadSingleRowAsync(
            """
            SELECT
                COUNT(1) AS Total,
                COALESCE(SUM(CASE WHEN Status = @Pending THEN 1 ELSE 0 END), 0) AS Pending,
                COALESCE(SUM(CASE WHEN Status = @Confirmed THEN 1 ELSE 0 END), 0) AS Confirmed,
                COALESCE(SUM(CASE WHEN CreatedAt >= @Cutoff THEN 1 ELSE 0 END), 0) AS NewLast7Days
            FROM dbo.Bookings;
            """,
            command =>
            {
                AddParameter(command, "@Pending", (int)BookingStatus.Pending);
                AddParameter(command, "@Confirmed", (int)BookingStatus.Confirmed);
                AddParameter(command, "@Cutoff", cutoff);
            },
            reader => new BookingDashboardStatsDto
            {
                Total = reader.GetInt32(0),
                Pending = reader.GetInt32(1),
                Confirmed = reader.GetInt32(2),
                NewLast7Days = reader.GetInt32(3)
            },
            ct);

        var contacts = await ReadSingleRowAsync(
            """
            SELECT
                COUNT(1) AS Total,
                COALESCE(SUM(CASE WHEN Status = @Unread THEN 1 ELSE 0 END), 0) AS Unread,
                COALESCE(SUM(CASE WHEN Status = @Replied THEN 1 ELSE 0 END), 0) AS Replied,
                COALESCE(SUM(CASE WHEN CreatedAt >= @Cutoff THEN 1 ELSE 0 END), 0) AS NewLast7Days
            FROM dbo.Contacts;
            """,
            command =>
            {
                AddParameter(command, "@Unread", (int)ContactStatus.Unread);
                AddParameter(command, "@Replied", (int)ContactStatus.Replied);
                AddParameter(command, "@Cutoff", cutoff);
            },
            reader => new ContactDashboardStatsDto
            {
                Total = reader.GetInt32(0),
                Unread = reader.GetInt32(1),
                Replied = reader.GetInt32(2),
                NewLast7Days = reader.GetInt32(3)
            },
            ct);

        var doctors = await ReadSingleRowAsync(
            """
            SELECT
                COUNT(1) AS Total,
                COALESCE(SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END), 0) AS Active,
                COALESCE(SUM(CASE WHEN IsManagement = 1 THEN 1 ELSE 0 END), 0) AS Management,
                COALESCE(SUM(CASE WHEN CreatedAt >= @Cutoff THEN 1 ELSE 0 END), 0) AS NewLast7Days
            FROM dbo.Doctors;
            """,
            command => AddParameter(command, "@Cutoff", cutoff),
            reader => new DoctorDashboardStatsDto
            {
                Total = reader.GetInt32(0),
                Active = reader.GetInt32(1),
                Management = reader.GetInt32(2),
                NewLast7Days = reader.GetInt32(3)
            },
            ct);

        return new DashboardStatsDto
        {
            Contents = contents,
            Bookings = bookings,
            Contacts = contacts,
            Doctors = doctors,
            GeneratedAtUtc = DateTime.UtcNow
        };
    }

    private async Task<T> ReadSingleRowAsync<T>(
        string sql,
        Action<DbCommand> configureCommand,
        Func<DbDataReader, T> map,
        CancellationToken ct)
    {
        var connection = _dbContext.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;

        if (shouldClose)
        {
            await _dbContext.Database.OpenConnectionAsync(ct);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = sql;
            configureCommand(command);

            await using var reader = await command.ExecuteReaderAsync(ct);
            if (!await reader.ReadAsync(ct))
            {
                throw new InvalidOperationException("Dashboard statistics query returned no rows.");
            }

            return map(reader);
        }
        finally
        {
            if (shouldClose)
            {
                await _dbContext.Database.CloseConnectionAsync();
            }
        }
    }

    private static void AddParameter(DbCommand command, string name, object value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        command.Parameters.Add(parameter);
    }
}
