using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.Article.Entities;

namespace Modules.Article.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Lang).IsRequired().HasMaxLength(10).HasDefaultValue("vi");
        builder.Property(x => x.SortOrder).HasDefaultValue(0);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.IsHomepageFeatured).HasDefaultValue(false);
        builder.Property(x => x.HomepageSubtitle).HasMaxLength(200);
        builder.Property(x => x.HomepageDescription).HasMaxLength(500);
        builder.Property(x => x.HomepageButtonText).HasMaxLength(100);
        builder.Property(x => x.HomepageButtonUrl).HasMaxLength(500);

        builder.HasIndex(x => new { x.Slug, x.Lang }).IsUnique();
        builder.HasIndex(x => x.ParentId);
        builder.HasIndex(x => new { x.Type, x.IsActive });
    }
}
