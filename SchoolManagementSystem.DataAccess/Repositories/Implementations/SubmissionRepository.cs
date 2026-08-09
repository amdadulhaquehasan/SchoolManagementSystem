using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class SubmissionRepository : GenericRepository<Submission>, ISubmissionRepository
{
    public SubmissionRepository(ApplicationDbContext context) : base(context) { }

    private IQueryable<Submission> WithDetails() =>
        DbSet.Include(s => s.Assignment).Include(s => s.Student);

    public async Task<Submission?> GetByAssignmentAndStudentAsync(int assignmentId, string studentId) =>
        await WithDetails().FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.StudentId == studentId);

    public async Task<IReadOnlyList<Submission>> GetByAssignmentAsync(int assignmentId) =>
        await WithDetails().Where(s => s.AssignmentId == assignmentId)
            .OrderByDescending(s => s.SubmittedAtUtc).ToListAsync();

    public async Task<IReadOnlyList<Submission>> GetByStudentAsync(string studentId) =>
        await WithDetails().Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAtUtc).ToListAsync();

    public async Task<Submission?> GetWithDetailsAsync(int id) =>
        await WithDetails().FirstOrDefaultAsync(s => s.Id == id);
}
