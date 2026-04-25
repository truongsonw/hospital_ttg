using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Modules.Booking.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Entities.Booking>
{
    public void Configure(EntityTypeBuilder<Entities.Booking> builder)
    {
        builder.ToTable("Bookings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(b => b.DateOfBirth)
            .IsRequired();

        builder.Property(b => b.AppointmentDate)
            .IsRequired();

        builder.Property(b => b.Symptoms)
            .HasMaxLength(2000);

        builder.Property(b => b.Status)
            .IsRequired();
    }
}
