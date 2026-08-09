using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    private IClassCourseRepository? _classCourses;
    private ISubjectRepository? _subjects;
    private ITeacherSubjectAssignmentRepository? _teacherSubjectAssignments;
    private IStudentClassEnrollmentRepository? _studentClassEnrollments;
    private IAssignmentRepository? _assignments;
    private ISubmissionRepository? _submissions;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IClassCourseRepository ClassCourses => _classCourses ??= new ClassCourseRepository(_context);
    public ISubjectRepository Subjects => _subjects ??= new SubjectRepository(_context);
    public ITeacherSubjectAssignmentRepository TeacherSubjectAssignments =>
        _teacherSubjectAssignments ??= new TeacherSubjectAssignmentRepository(_context);
    public IStudentClassEnrollmentRepository StudentClassEnrollments =>
        _studentClassEnrollments ??= new StudentClassEnrollmentRepository(_context);
    public IAssignmentRepository Assignments => _assignments ??= new AssignmentRepository(_context);
    public ISubmissionRepository Submissions => _submissions ??= new SubmissionRepository(_context);

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
