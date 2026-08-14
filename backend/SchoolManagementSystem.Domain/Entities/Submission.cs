using SchoolManagementSystem.Domain.Enums;

namespace SchoolManagementSystem.Domain.Entities;

public class Submission : BaseEntity
{
    public int AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public ApplicationUser Student { get; set; } = null!;

    public string? TextAnswer { get; set; }

    /// <summary>Relative path (under wwwroot/submissions) of the file the student attached.</summary>
    public string? FilePath { get; set; }
    public string? OriginalFileName { get; set; }

    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastUpdatedAtUtc { get; set; }

    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;

    public int? MarksObtained { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAtUtc { get; set; }
}
