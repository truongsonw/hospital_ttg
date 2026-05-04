namespace Contracts.System.DTOs;

public class DashboardStatsDto
{
    public ContentDashboardStatsDto Contents { get; set; } = new();
    public BookingDashboardStatsDto Bookings { get; set; } = new();
    public ContactDashboardStatsDto Contacts { get; set; } = new();
    public DoctorDashboardStatsDto Doctors { get; set; } = new();
    public DateTime GeneratedAtUtc { get; set; }
}

public class ContentDashboardStatsDto
{
    public int Total { get; set; }
    public int Published { get; set; }
    public int Draft { get; set; }
    public int Hot { get; set; }
    public int NewLast7Days { get; set; }
}

public class BookingDashboardStatsDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Confirmed { get; set; }
    public int NewLast7Days { get; set; }
}

public class ContactDashboardStatsDto
{
    public int Total { get; set; }
    public int Unread { get; set; }
    public int Replied { get; set; }
    public int NewLast7Days { get; set; }
}

public class DoctorDashboardStatsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Management { get; set; }
    public int NewLast7Days { get; set; }
}
