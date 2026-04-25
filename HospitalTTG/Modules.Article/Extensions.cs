using Contracts.Article.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Article.Configurations;
using Modules.Article.Repositories;
using Modules.Article.Services;
using Shared.Infrastructure.Data;

namespace Modules.Article;

public static class Extensions
{
    public static IServiceCollection AddArticleModule(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof(CategoryConfiguration).Assembly);

        // Repositories
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IContentRepository, ContentRepository>();
        services.AddScoped<IContentMediaRepository, ContentMediaRepository>();

        // Services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IContentService, ContentService>();
        services.AddScoped<IContentMediaService, ContentMediaService>();

        return services;
    }
}
