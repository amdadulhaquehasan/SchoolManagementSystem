using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.ClassCourses;

public class EnrollStudentDto
{
    [Required]
    public string StudentId { get; set; } = string.Empty;
}
