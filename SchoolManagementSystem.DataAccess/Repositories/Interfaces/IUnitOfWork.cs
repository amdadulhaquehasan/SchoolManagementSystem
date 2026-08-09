namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IClassCourseRepository ClassCourses { get; }
    ISubjectRepository Subjects { get; }
    ITeacherSubjectAssignmentRepository TeacherSubjectAssignments { get; }
    IStudentClassEnrollmentRepository StudentClassEnrollments { get; }
    IAssignmentRepository Assignments { get; }
    ISubmissionRepository Submissions { get; }

    Task<int> SaveChangesAsync();
}
