using Modules.Contact.Entities;
using Shared.Infrastructure.Data;

namespace Modules.Contact.Repositories;

public class ContactRepository : BaseRepository<Entities.Contact>, IContactRepository
{
    public ContactRepository(AppDbContext context) : base(context)
    {
    }
}
