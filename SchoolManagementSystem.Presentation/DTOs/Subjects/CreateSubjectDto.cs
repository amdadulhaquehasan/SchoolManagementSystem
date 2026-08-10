using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.Subjects;

public class CreateSubjectDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public int ClassCourseId { get; set; }
}
