using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Modules.Contact.Configurations;

public class ContactConfiguration : IEntityTypeConfiguration<Entities.Contact>
{
    public void Configure(EntityTypeBuilder<Entities.Contact> builder)
    {
        builder.ToTable("Contacts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Subject)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(c => c.Status)
            .IsRequired();
    }
}
