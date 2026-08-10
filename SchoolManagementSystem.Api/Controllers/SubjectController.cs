using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Presentation.DTOs.Subjects;

namespace SchoolManagementSystem.Api.Controllers;

[ApiController]
[Route("api/subjects")]
[Authorize]
public class SubjectController : BaseApiController
{
    private readonly ISubjectService _subjectService;

    public SubjectController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SubjectDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SubjectDto>>> GetAll([FromQuery] int? classCourseId) =>
        Ok(await _subjectService.GetAllAsync(classCourseId));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SubjectDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SubjectDto>> GetById(int id) =>
        Ok(await _subjectService.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(SubjectDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SubjectDto>> Create([FromBody] CreateSubjectDto dto)
    {
        var result = await _subjectService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<SubjectDto>> Update(int id, [FromBody] CreateSubjectDto dto) =>
        Ok(await _subjectService.UpdateAsync(id, dto));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        await _subjectService.DeleteAsync(id);
        return NoContent();
    }


    [HttpPost("{id:int}/teachers")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> AssignTeacher(int id, [FromBody] AssignTeacherDto dto)
    {
        await _subjectService.AssignTeacherAsync(id, dto.TeacherId);
        return NoContent();
    }

    [HttpDelete("{id:int}/teachers/{teacherId}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> UnassignTeacher(int id, string teacherId)
    {
        await _subjectService.UnassignTeacherAsync(id, teacherId);
        return NoContent();
    }
}
