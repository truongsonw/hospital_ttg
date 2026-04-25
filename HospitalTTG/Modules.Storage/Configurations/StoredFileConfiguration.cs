using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modules.Storage.Entities;

namespace Modules.Storage.Configurations;

public class StoredFileConfiguration : IEntityTypeConfiguration<StoredFile>
{
    public void Configure(EntityTypeBuilder<StoredFile> builder)
    {
        builder.ToTable("StoredFiles");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.StoredFileName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.OriginalFileName)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(f => f.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.FileSize)
            .IsRequired();

        builder.Property(f => f.PhysicalPath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasIndex(f => f.StoredFileName).IsUnique();
    }
}
