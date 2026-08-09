namespace SchoolManagementSystem.Domain.Entities;

public class TeacherSubjectAssignment : BaseEntity
{
    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;

    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
}
