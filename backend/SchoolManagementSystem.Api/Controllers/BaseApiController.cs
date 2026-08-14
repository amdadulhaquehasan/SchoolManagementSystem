using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace SchoolManagementSystem.Api.Controllers;

public abstract class BaseApiController : ControllerBase
{
    protected string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("User id claim missing from token.");

    protected string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role)
        ?? throw new UnauthorizedAccessException("Role claim missing from token.");
}
