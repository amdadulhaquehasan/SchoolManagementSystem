using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SchoolManagementSystem.Presentation.DTOs.Assignments;

public class CreateAssignmentDto
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime DeadlineUtc { get; set; }

    [Required, Range(1, 1000)]
    public int MaxMarks { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int ClassCourseId { get; set; }

    public bool Publish { get; set; } = false;

    public IFormFile? File { get; set; }
}
