using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.System.Entities;

namespace Modules.System.Configurations;

public class RoleMenuConfiguration : IEntityTypeConfiguration<RoleMenu>
{
    public void Configure(EntityTypeBuilder<RoleMenu> builder)
    {
        builder.ToTable("RoleMenus");

        builder.HasKey(rm => rm.Id);

        builder.Property(rm => rm.RoleId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(rm => rm.CreatedBy)
            .HasMaxLength(100);

        builder.HasIndex(rm => new { rm.RoleId, rm.MenuId }).IsUnique();
    }
}
