using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Shared.Abstractions.Exceptions;

namespace Shared.Infrastructure.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BaseException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            context.Response.ContentType = "application/problem+json";

            var problemDetails = new ProblemDetails
            {
                Status = ex.StatusCode,
                Title = "An error occurred",
                Detail = ex.Message
            };

            if (ex is ValidationException validationEx)
            {
                problemDetails.Title = "Validation Error";
                problemDetails.Extensions["errors"] = validationEx.Errors;
            }

            await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occurred.",
                Detail = _env.IsDevelopment() ? $"{ex.GetType().Name}: {ex.Message}" : null
            };

            if (_env.IsDevelopment())
                problemDetails.Extensions["stackTrace"] = ex.StackTrace;

            await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
        }
    }
}
