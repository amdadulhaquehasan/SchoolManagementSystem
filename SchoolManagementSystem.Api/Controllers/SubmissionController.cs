using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Presentation.DTOs.Submissions;

namespace SchoolManagementSystem.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class SubmissionController : BaseApiController
{
    private readonly ISubmissionService _submissionService;

    public SubmissionController(ISubmissionService submissionService)
    {
        _submissionService = submissionService;
    }


    [HttpPost("assignments/{assignmentId:int}/submissions")]
    [Authorize(Roles = AppRoles.Student)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(SubmissionDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SubmissionDto>> Submit(int assignmentId, [FromForm] CreateSubmissionDto dto)
    {
        var result = await _submissionService.SubmitAsync(assignmentId, CurrentUserId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }


    [HttpPut("submissions/{id:int}")]
    [Authorize(Roles = AppRoles.Student)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<SubmissionDto>> Update(int id, [FromForm] UpdateSubmissionDto dto) =>
        Ok(await _submissionService.UpdateAsync(id, CurrentUserId, dto));


    [HttpGet("submissions/{id:int}")]
    [ProducesResponseType(typeof(SubmissionDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubmissionDto>> GetById(int id) =>
        Ok(await _submissionService.GetByIdAsync(id, CurrentUserId, CurrentUserRole));


    [HttpGet("submissions/my")]
    [Authorize(Roles = AppRoles.Student)]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SubmissionDto>>> GetMine() =>
        Ok(await _submissionService.GetMySubmissionsAsync(CurrentUserId));


    [HttpGet("assignments/{assignmentId:int}/submissions")]
    [Authorize(Roles = $"{AppRoles.Teacher},{AppRoles.Admin}")]
    [ProducesResponseType(typeof(IReadOnlyList<SubmissionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SubmissionDto>>> GetByAssignment(int assignmentId) =>
        Ok(await _submissionService.GetByAssignmentAsync(assignmentId, CurrentUserId, CurrentUserRole));


    [HttpPut("submissions/{id:int}/grade")]
    [Authorize(Roles = AppRoles.Teacher)]
    public async Task<ActionResult<SubmissionDto>> Grade(int id, [FromBody] GradeSubmissionDto dto) =>
        Ok(await _submissionService.GradeAsync(id, CurrentUserId, dto));


    [HttpPatch("submissions/{id:int}/status")]
    [Authorize(Roles = AppRoles.Teacher)]
    public async Task<ActionResult<SubmissionDto>> ChangeStatus(int id, [FromBody] ChangeSubmissionStatusDto dto) =>
        Ok(await _submissionService.ChangeStatusAsync(id, CurrentUserId, dto));
}
