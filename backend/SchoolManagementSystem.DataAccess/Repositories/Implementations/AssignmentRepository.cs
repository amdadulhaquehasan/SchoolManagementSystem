using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Domain.Enums;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class AssignmentRepository : GenericRepository<Assignment>, IAssignmentRepository
{
    public AssignmentRepository(ApplicationDbContext context) : base(context) { }

    private IQueryable<Assignment> WithDetails() =>
        DbSet.Include(a => a.Subject)
             .Include(a => a.ClassCourse)
             .Include(a => a.Teacher)
             .Include(a => a.Submissions);

    public async Task<Assignment?> GetWithDetailsAsync(int id) =>
        await WithDetails().FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IReadOnlyList<Assignment>> GetByTeacherAsync(string teacherId) =>
        await WithDetails().Where(a => a.TeacherId == teacherId)
            .OrderByDescending(a => a.CreatedAtUtc).ToListAsync();

    public async Task<IReadOnlyList<Assignment>> GetPublishedForStudentClassesAsync(IEnumerable<int> classCourseIds) =>
        await WithDetails()
            .Where(a => a.Status == AssignmentStatus.Published && classCourseIds.Contains(a.ClassCourseId))
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

    public async Task<IReadOnlyList<Assignment>> GetAllWithDetailsAsync() =>
        await WithDetails().OrderByDescending(a => a.CreatedAtUtc).ToListAsync();
}
