namespace SchoolManagementSystem.Presentation.DTOs.ClassCourses;

public class ClassCourseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SubjectCount { get; set; }
    public int EnrolledStudentCount { get; set; }
}
