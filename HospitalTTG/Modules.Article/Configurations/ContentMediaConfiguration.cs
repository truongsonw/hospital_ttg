using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.Article.Entities;

namespace Modules.Article.Configurations;

public class ContentMediaConfiguration : IEntityTypeConfiguration<ContentMedia>
{
    public void Configure(EntityTypeBuilder<ContentMedia> builder)
    {
        builder.ToTable("ContentMedias");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.MediaType).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Url).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Caption).HasMaxLength(255);
        builder.Property(x => x.IsThumbnail).HasDefaultValue(false);
        builder.Property(x => x.SortOrder).HasDefaultValue(0);

        builder.HasIndex(x => new { x.ContentId, x.SortOrder });
    }
}
