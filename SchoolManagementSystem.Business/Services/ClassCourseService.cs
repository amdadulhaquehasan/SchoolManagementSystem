using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Presentation.DTOs.ClassCourses;

namespace SchoolManagementSystem.Business.Services;

public class ClassCourseService : IClassCourseService
{
    private readonly IUnitOfWork _unitOfWork;

    public ClassCourseService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ClassCourseDto> CreateAsync(CreateClassCourseDto dto)
    {
        if (await _unitOfWork.ClassCourses.ExistsAsync(c => c.Name == dto.Name))
            throw new BadRequestException($"A class/course named '{dto.Name}' already exists.");

        var entity = new ClassCourse { Name = dto.Name, Description = dto.Description };
        await _unitOfWork.ClassCourses.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<ClassCourseDto> UpdateAsync(int id, CreateClassCourseDto dto)
    {
        var entity = await _unitOfWork.ClassCourses.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(ClassCourse), id);

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        _unitOfWork.ClassCourses.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _unitOfWork.ClassCourses.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(ClassCourse), id);

        _unitOfWork.ClassCourses.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<ClassCourseDto> GetByIdAsync(int id)
    {
        var entity = await _unitOfWork.ClassCourses.GetWithSubjectsAsync(id)
            ?? throw new NotFoundException(nameof(ClassCourse), id);

        return ToDto(entity);
    }

    public async Task<IReadOnlyList<ClassCourseDto>> GetAllAsync()
    {
        var all = await _unitOfWork.ClassCourses.Query()
            .Select(c => new ClassCourseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                SubjectCount = c.Subjects.Count,
                EnrolledStudentCount = c.StudentEnrollments.Count
            }).ToListAsync();

        return all;
    }

    public async Task EnrollStudentAsync(int classCourseId, string studentId)
    {
        var classCourse = await _unitOfWork.ClassCourses.GetByIdAsync(classCourseId)
            ?? throw new NotFoundException(nameof(ClassCourse), classCourseId);

        var alreadyEnrolled = await _unitOfWork.StudentClassEnrollments
            .ExistsAsync(e => e.StudentId == studentId && e.ClassCourseId == classCourseId);

        if (alreadyEnrolled)
            throw new BadRequestException("Student is already enrolled in this class/course.");

        await _unitOfWork.StudentClassEnrollments.AddAsync(new StudentClassEnrollment
        {
            StudentId = studentId,
            ClassCourseId = classCourse.Id
        });
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UnenrollStudentAsync(int classCourseId, string studentId)
    {
        var enrollment = await _unitOfWork.StudentClassEnrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.ClassCourseId == classCourseId)
            ?? throw new NotFoundException("Enrollment", $"{studentId}/{classCourseId}");

        _unitOfWork.StudentClassEnrollments.Remove(enrollment);
        await _unitOfWork.SaveChangesAsync();
    }

    private static ClassCourseDto ToDto(ClassCourse c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        SubjectCount = c.Subjects?.Count ?? 0,
        EnrolledStudentCount = c.StudentEnrollments?.Count ?? 0
    };
}
