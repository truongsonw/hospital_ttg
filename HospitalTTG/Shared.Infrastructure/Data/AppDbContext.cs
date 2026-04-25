using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared.Abstractions.Entities;
using Shared.Abstractions.Interfaces;

namespace Shared.Infrastructure.Data;

public class AppDbContext : DbContext, IUnitOfWork
{
    private static readonly List<Assembly> _moduleAssemblies = [];
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public AppDbContext(DbContextOptions<AppDbContext> options,
        IHttpContextAccessor? httpContextAccessor = null) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public static void RegisterModuleAssembly(Assembly assembly)
    {
        if (!_moduleAssemblies.Contains(assembly))
            _moduleAssemblies.Add(assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var username = _httpContextAccessor?.HttpContext?.User
            .FindFirstValue(ClaimTypes.Name);

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        if (username != null)
        {
            foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                    entry.Entity.CreatedBy = username;
                else if (entry.State == EntityState.Modified)
                    entry.Entity.UpdatedBy = username;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach (var assembly in _moduleAssemblies)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);
        }
    }
}
