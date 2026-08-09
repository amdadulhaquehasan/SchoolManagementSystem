namespace SchoolManagementSystem.Domain.Entities;

public class ClassCourse : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<StudentClassEnrollment> StudentEnrollments { get; set; } = new List<StudentClassEnrollment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
