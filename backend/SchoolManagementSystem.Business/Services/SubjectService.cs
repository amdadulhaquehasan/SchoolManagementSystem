using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Presentation.DTOs.Subjects;

namespace SchoolManagementSystem.Business.Services;

public class SubjectService : ISubjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public SubjectService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<SubjectDto> CreateAsync(CreateSubjectDto dto)
    {
        var classCourse = await _unitOfWork.ClassCourses.GetByIdAsync(dto.ClassCourseId)
            ?? throw new NotFoundException(nameof(ClassCourse), dto.ClassCourseId);

        var entity = new Subject
        {
            Name = dto.Name,
            Description = dto.Description,
            ClassCourseId = classCourse.Id
        };

        await _unitOfWork.Subjects.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(entity.Id);
    }

    public async Task<SubjectDto> UpdateAsync(int id, CreateSubjectDto dto)
    {
        var entity = await _unitOfWork.Subjects.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Subject), id);

        var classCourse = await _unitOfWork.ClassCourses.GetByIdAsync(dto.ClassCourseId)
            ?? throw new NotFoundException(nameof(ClassCourse), dto.ClassCourseId);

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.ClassCourseId = classCourse.Id;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        _unitOfWork.Subjects.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(entity.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _unitOfWork.Subjects.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Subject), id);

        _unitOfWork.Subjects.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<SubjectDto> GetByIdAsync(int id) => await ToDtoAsync(id);

    public async Task<IReadOnlyList<SubjectDto>> GetAllAsync(int? classCourseId)
    {
        var query = _unitOfWork.Subjects.Query()
            .Include(s => s.ClassCourse)
            .Include(s => s.TeacherAssignments).ThenInclude(t => t.Teacher)
            .AsQueryable();

        if (classCourseId.HasValue)
            query = query.Where(s => s.ClassCourseId == classCourseId.Value);

        var subjects = await query.ToListAsync();

        return subjects.Select(MapToDto).ToList();
    }

    public async Task AssignTeacherAsync(int subjectId, string teacherId)
    {
        var subject = await _unitOfWork.Subjects.GetByIdAsync(subjectId)
            ?? throw new NotFoundException(nameof(Subject), subjectId);

        var teacher = await _userManager.FindByIdAsync(teacherId)
            ?? throw new NotFoundException("Teacher", teacherId);

        if (!await _userManager.IsInRoleAsync(teacher, AppRoles.Teacher))
            throw new BadRequestException("The specified user is not a Teacher.");

        var alreadyAssigned = await _unitOfWork.TeacherSubjectAssignments
            .ExistsAsync(a => a.TeacherId == teacherId && a.SubjectId == subjectId);

        if (alreadyAssigned)
            throw new BadRequestException("This teacher is already assigned to the subject.");

        await _unitOfWork.TeacherSubjectAssignments.AddAsync(new TeacherSubjectAssignment
        {
            TeacherId = teacherId,
            SubjectId = subjectId
        });
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UnassignTeacherAsync(int subjectId, string teacherId)
    {
        var assignment = await _unitOfWork.TeacherSubjectAssignments
            .FirstOrDefaultAsync(a => a.TeacherId == teacherId && a.SubjectId == subjectId)
            ?? throw new NotFoundException("TeacherSubjectAssignment", $"{teacherId}/{subjectId}");

        _unitOfWork.TeacherSubjectAssignments.Remove(assignment);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<SubjectDto> ToDtoAsync(int subjectId)
    {
        var subject = await _unitOfWork.Subjects.Query()
            .Include(s => s.ClassCourse)
            .Include(s => s.TeacherAssignments).ThenInclude(t => t.Teacher)
            .FirstOrDefaultAsync(s => s.Id == subjectId)
            ?? throw new NotFoundException(nameof(Subject), subjectId);

        return MapToDto(subject);
    }

    private static SubjectDto MapToDto(Subject s) => new()
    {
        Id = s.Id,
        Name = s.Name,
        Description = s.Description,
        ClassCourseId = s.ClassCourseId,
        ClassCourseName = s.ClassCourse?.Name ?? string.Empty,
        AssignedTeachers = s.TeacherAssignments?
            .Select(t => new AssignedTeacherDto { Id = t.TeacherId, FullName = t.Teacher.FullName })
            .ToList() ?? new List<AssignedTeacherDto>()
    };
}
