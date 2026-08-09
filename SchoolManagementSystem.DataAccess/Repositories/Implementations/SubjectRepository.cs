using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class SubjectRepository : GenericRepository<Subject>, ISubjectRepository
{
    public SubjectRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Subject?> GetWithClassCourseAsync(int id) =>
        await DbSet.Include(s => s.ClassCourse).FirstOrDefaultAsync(s => s.Id == id);

    public async Task<bool> IsTeacherAssignedAsync(string teacherId, int subjectId) =>
        await Context.TeacherSubjectAssignments
            .AnyAsync(a => a.TeacherId == teacherId && a.SubjectId == subjectId);
}
