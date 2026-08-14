using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Presentation.DTOs.Assignments;

namespace SchoolManagementSystem.Api.Controllers;

[ApiController]
[Route("api/assignments")]
[Authorize]
public class AssignmentController : BaseApiController
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }


    [HttpPost]
    [Authorize(Roles = AppRoles.Teacher)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<AssignmentDto>> Create([FromForm] CreateAssignmentDto dto)
    {
        var result = await _assignmentService.CreateAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }


    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.Teacher)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<AssignmentDto>> Update(int id, [FromForm] UpdateAssignmentDto dto) =>
        Ok(await _assignmentService.UpdateAsync(id, CurrentUserId, dto));


    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = AppRoles.Teacher)]
    public async Task<ActionResult<AssignmentDto>> ChangeStatus(int id, [FromBody] ChangeAssignmentStatusDto dto) =>
        Ok(await _assignmentService.ChangeStatusAsync(id, CurrentUserId, dto.Publish));


    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _assignmentService.DeleteAsync(id, CurrentUserId, CurrentUserRole == AppRoles.Admin);
        return NoContent();
    }


    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AssignmentDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AssignmentDto>> GetById(int id) =>
        Ok(await _assignmentService.GetByIdAsync(id, CurrentUserId, CurrentUserRole));


    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AssignmentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AssignmentDto>>> GetAll()
    {
        IReadOnlyList<AssignmentDto> result = CurrentUserRole switch
        {
            AppRoles.Admin => await _assignmentService.GetForAdminAsync(),
            AppRoles.Teacher => await _assignmentService.GetForTeacherAsync(CurrentUserId),
            AppRoles.Student => await _assignmentService.GetForStudentAsync(CurrentUserId),
            _ => Array.Empty<AssignmentDto>()
        };

        return Ok(result);
    }
}
