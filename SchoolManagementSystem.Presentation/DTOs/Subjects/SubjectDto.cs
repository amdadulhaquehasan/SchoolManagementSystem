namespace SchoolManagementSystem.Presentation.DTOs.Subjects;

public class SubjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ClassCourseId { get; set; }
    public string ClassCourseName { get; set; } = string.Empty;
    public List<string> AssignedTeacherNames { get; set; } = new();
}
