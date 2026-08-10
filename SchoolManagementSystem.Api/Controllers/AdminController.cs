using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Presentation.DTOs.Users;

namespace SchoolManagementSystem.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminController : BaseApiController
{
    private readonly IUserManagementService _userManagementService;

    public AdminController(IUserManagementService userManagementService)
    {
        _userManagementService = userManagementService;
    }

    [HttpPost("teachers")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserDto>> CreateTeacher([FromBody] CreateTeacherDto dto)
    {
        var result = await _userManagementService.CreateTeacherAsync(dto);
        return CreatedAtAction(nameof(GetUser), new { userId = result.Id }, result);
    }

    [HttpPost("students")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserDto>> CreateStudent([FromBody] CreateStudentDto dto)
    {
        var result = await _userManagementService.CreateStudentAsync(dto);
        return CreatedAtAction(nameof(GetUser), new { userId = result.Id }, result);
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetUsers([FromQuery] string? role) =>
        Ok(await _userManagementService.GetUsersByRoleAsync(role));

    [HttpGet("users/{userId}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> GetUser(string userId) =>
        Ok(await _userManagementService.GetByIdAsync(userId));

    [HttpPut("users/{userId}/deactivate")]
    public async Task<IActionResult> Deactivate(string userId)
    {
        await _userManagementService.DeactivateUserAsync(userId);
        return NoContent();
    }

    [HttpPut("users/{userId}/activate")]
    public async Task<IActionResult> Activate(string userId)
    {
        await _userManagementService.ActivateUserAsync(userId);
        return NoContent();
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        await _userManagementService.DeleteUserAsync(userId);
        return NoContent();
    }
}
