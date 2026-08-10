using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.Submissions;

public class GradeSubmissionDto
{
    [Required, Range(0, 1000)]
    public int MarksObtained { get; set; }

    public string? Feedback { get; set; }
}
