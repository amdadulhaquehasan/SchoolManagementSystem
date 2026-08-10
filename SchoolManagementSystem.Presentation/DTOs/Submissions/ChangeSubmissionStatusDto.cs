using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.Submissions;

public class ChangeSubmissionStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
