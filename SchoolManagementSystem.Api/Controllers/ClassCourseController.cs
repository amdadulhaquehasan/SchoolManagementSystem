using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Presentation.DTOs.ClassCourses;

namespace SchoolManagementSystem.Api.Controllers;

[ApiController]
[Route("api/classcourses")]
[Authorize]
public class ClassCourseController : BaseApiController
{
    private readonly IClassCourseService _classCourseService;

    public ClassCourseController(IClassCourseService classCourseService)
    {
        _classCourseService = classCourseService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ClassCourseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ClassCourseDto>>> GetAll() =>
        Ok(await _classCourseService.GetAllAsync());

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ClassCourseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ClassCourseDto>> GetById(int id) =>
        Ok(await _classCourseService.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    [ProducesResponseType(typeof(ClassCourseDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ClassCourseDto>> Create([FromBody] CreateClassCourseDto dto)
    {
        var result = await _classCourseService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<ClassCourseDto>> Update(int id, [FromBody] CreateClassCourseDto dto) =>
        Ok(await _classCourseService.UpdateAsync(id, dto));

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        await _classCourseService.DeleteAsync(id);
        return NoContent();
    }


    [HttpPost("{id:int}/students")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> EnrollStudent(int id, [FromBody] EnrollStudentDto dto)
    {
        await _classCourseService.EnrollStudentAsync(id, dto.StudentId);
        return NoContent();
    }

    [HttpDelete("{id:int}/students/{studentId}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> UnenrollStudent(int id, string studentId)
    {
        await _classCourseService.UnenrollStudentAsync(id, studentId);
        return NoContent();
    }
}
