using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.Article.Entities;

namespace Modules.Article.Configurations;

public class ContentConfiguration : IEntityTypeConfiguration<Content>
{
    public void Configure(EntityTypeBuilder<Content> builder)
    {
        builder.ToTable("Contents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ContentType).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Slug).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Thumbnail).HasMaxLength(500);
        builder.Property(x => x.FileAttach).HasMaxLength(500);
        builder.Property(x => x.Tags).HasMaxLength(500);
        builder.Property(x => x.Status).HasDefaultValue((byte)1);
        builder.Property(x => x.IsHot).HasDefaultValue(false);
        builder.Property(x => x.ViewCount).HasDefaultValue(0);

        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => new { x.CategoryId, x.Status });
        builder.HasIndex(x => new { x.ContentType, x.Status });
        builder.HasIndex(x => x.PublishedAt);
        builder.HasIndex(x => new { x.IsHot, x.Status });
    }
}
