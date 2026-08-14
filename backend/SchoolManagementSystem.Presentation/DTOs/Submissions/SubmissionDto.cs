namespace SchoolManagementSystem.Presentation.DTOs.Submissions;

public class SubmissionDto
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;

    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;

    public string? TextAnswer { get; set; }
    public string? FileUrl { get; set; }
    public string? OriginalFileName { get; set; }

    public DateTime SubmittedAtUtc { get; set; }
    public DateTime? LastUpdatedAtUtc { get; set; }

    public string Status { get; set; } = string.Empty;
    public int? MarksObtained { get; set; }
    public int MaxMarks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAtUtc { get; set; }
}
