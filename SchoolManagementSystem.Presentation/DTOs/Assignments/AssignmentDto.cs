namespace SchoolManagementSystem.Presentation.DTOs.Assignments;

public class AssignmentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DeadlineUtc { get; set; }
    public int MaxMarks { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentOriginalFileName { get; set; }

    public string TeacherId { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;

    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;

    public int ClassCourseId { get; set; }
    public string ClassCourseName { get; set; } = string.Empty;

    public int SubmissionCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public string? MySubmissionStatus { get; set; }
}
