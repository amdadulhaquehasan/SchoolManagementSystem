namespace SchoolManagementSystem.Domain.Entities;

public class StudentClassEnrollment : BaseEntity
{
    public string StudentId { get; set; } = string.Empty;
    public ApplicationUser Student { get; set; } = null!;

    public int ClassCourseId { get; set; }
    public ClassCourse ClassCourse { get; set; } = null!;
}
