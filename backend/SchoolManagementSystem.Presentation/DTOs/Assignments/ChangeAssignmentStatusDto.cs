using System.ComponentModel.DataAnnotations;

namespace SchoolManagementSystem.Presentation.DTOs.Assignments;

public class ChangeAssignmentStatusDto
{
    [Required]
    public bool Publish { get; set; }
}
