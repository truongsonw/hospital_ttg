using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.System.Entities;

namespace Modules.System.Configurations;

internal sealed class SysCategoryConfiguration : IEntityTypeConfiguration<SysCategory>
{
    public void Configure(EntityTypeBuilder<SysCategory> builder)
    {
        builder.ToTable("SysCategories");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(100);
        builder.Property(x => x.Name).HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Ext1s).HasMaxLength(1000);
        builder.Property(x => x.Ext1d).HasColumnType("decimal(18,4)");
    }
}
