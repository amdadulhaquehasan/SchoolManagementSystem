using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.Subjects;

public class AssignTeacherDto
{
    [Required]
    public string TeacherId { get; set; } = string.Empty;
}
