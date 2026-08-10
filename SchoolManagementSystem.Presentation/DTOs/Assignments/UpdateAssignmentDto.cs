using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SchoolManagementSystem.Presentation.DTOs.Assignments;

public class UpdateAssignmentDto
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime DeadlineUtc { get; set; }

    [Required, Range(1, 1000)]
    public int MaxMarks { get; set; }

    public IFormFile? File { get; set; }

    public bool RemoveExistingFile { get; set; } = false;
}
