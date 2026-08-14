using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class TeacherSubjectAssignmentRepository : GenericRepository<TeacherSubjectAssignment>, ITeacherSubjectAssignmentRepository
{
    public TeacherSubjectAssignmentRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<TeacherSubjectAssignment>> GetByTeacherAsync(string teacherId) =>
        await DbSet.Include(a => a.Subject).ThenInclude(s => s.ClassCourse)
            .Where(a => a.TeacherId == teacherId).ToListAsync();
}
