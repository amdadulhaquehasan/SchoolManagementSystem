using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.ClassCourses;

public class CreateClassCourseDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
