using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Modules.Doctor.Configurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Entities.Doctor>
{
    public void Configure(EntityTypeBuilder<Entities.Doctor> builder)
    {
        builder.ToTable("Doctors");
        builder.Property(d => d.FullName).HasMaxLength(200).IsRequired();
        builder.Property(d => d.AcademicTitle).HasMaxLength(100);
        builder.Property(d => d.Position).HasMaxLength(200);
        builder.Property(d => d.Specialty).HasMaxLength(200);
        builder.Property(d => d.AvatarUrl).HasMaxLength(500);
    }
}
