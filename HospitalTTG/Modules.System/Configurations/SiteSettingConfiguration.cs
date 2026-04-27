using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.System.Entities;

namespace Modules.System.Configurations;

internal sealed class SiteSettingConfiguration : IEntityTypeConfiguration<SiteSetting>
{
    public void Configure(EntityTypeBuilder<SiteSetting> builder)
    {
        builder.ToTable("SiteSettings");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.Key).IsUnique();

        builder.Property(x => x.Key).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Value).HasColumnType("nvarchar(max)");
        builder.Property(x => x.Group).HasMaxLength(50).IsRequired();
        builder.Property(x => x.UpdatedBy).HasMaxLength(200);
    }
}
