using System.Net;
using System.Text.Json;
using SchoolManagementSystem.DataAccess.Exceptions;

namespace SchoolManagementSystem.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            ForbiddenAccessException => (HttpStatusCode.Forbidden, "Access denied"),
            ValidationAppException => (HttpStatusCode.UnprocessableEntity, "Validation failed"),
            BadRequestException => (HttpStatusCode.BadRequest, "Bad request"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception occurred while processing {Path}", context.Request.Path);
        else
            _logger.LogWarning("{ExceptionType}: {Message}", exception.GetType().Name, exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var payload = new Dictionary<string, object?>
        {
            ["status"] = (int)statusCode,
            ["title"] = title,
            ["message"] = exception.Message,
            ["traceId"] = context.TraceIdentifier
        };

        if (exception is ValidationAppException validationEx)
            payload["errors"] = validationEx.Errors;

        if (_env.IsDevelopment() && statusCode == HttpStatusCode.InternalServerError)
            payload["stackTrace"] = exception.StackTrace;

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
        await context.Response.WriteAsync(json);
    }
}

public static class ExceptionHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app) =>
        app.UseMiddleware<ExceptionHandlingMiddleware>();
}
