using Modules.Auth;
using Modules.System;
using Modules.Article;
using Modules.Contact;
using Modules.Booking;
using Modules.Storage;
using Shared.Infrastructure;
using Shared.Infrastructure.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Shared infrastructure (DbContext, UnitOfWork)
builder.Services.AddSharedInfrastructure(builder.Configuration);

// Modules
builder.Services.AddAuthModule(builder.Configuration);
builder.Services.AddSystemModule(builder.Configuration);
builder.Services.AddArticleModule(builder.Configuration);
builder.Services.AddContactModule(builder.Configuration);
builder.Services.AddBookingModule(builder.Configuration);
builder.Services.AddStorageModule(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("Frontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
