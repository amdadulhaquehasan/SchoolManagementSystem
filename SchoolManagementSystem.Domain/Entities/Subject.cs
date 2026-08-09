namespace SchoolManagementSystem.Domain.Entities;

public class Subject : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;

    public ICollection<TeacherSubjectAssignment> TeacherAssignments { get; set; } = new List<TeacherSubjectAssignment>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
