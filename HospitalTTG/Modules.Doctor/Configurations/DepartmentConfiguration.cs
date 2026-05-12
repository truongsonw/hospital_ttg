using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Modules.Doctor.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Entities.Department>
{
    public void Configure(EntityTypeBuilder<Entities.Department> builder)
    {
        builder.ToTable("Departments");
        builder.Property(d => d.Name).HasMaxLength(200).IsRequired();
        builder.Property(d => d.Slug).HasMaxLength(500).IsRequired();
        builder.Property(d => d.Description);
        builder.Property(d => d.IsHomepageFeatured).HasDefaultValue(false);
    }
}
