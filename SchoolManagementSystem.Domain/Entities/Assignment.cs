using SchoolManagementSystem.Domain.Enums;

namespace SchoolManagementSystem.Domain.Entities;

public class Assignment : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DeadlineUtc { get; set; }
    public int MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;

    /// <summary>Relative path (under wwwroot/assignments) of the file the teacher attached.</summary>
    public string? AttachmentPath { get; set; }
    public string? AttachmentOriginalFileName { get; set; }

    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;

    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
