namespace SchoolManagementSystem.Presentation.DTOs.Subjects;

public class AssignedTeacherDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

public class SubjectDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ClassCourseId { get; set; }
    public string ClassCourseName { get; set; } = string.Empty;

    public List<AssignedTeacherDto> AssignedTeachers { get; set; } = new();
}
