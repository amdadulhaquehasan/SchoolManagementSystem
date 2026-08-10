using FluentAssertions;
using Moq;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Business.Services;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Implementations;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Domain.Enums;
using SchoolManagementSystem.Presentation.DTOs.Assignments;
using SchoolManagementSystem.Tests.Helpers;
using Xunit;

namespace SchoolManagementSystem.Tests.Services;

public class AssignmentServiceTests
{
    private static (AssignmentService service, UnitOfWork uow) CreateService(Mock<IFileService>? fileServiceMock = null)
    {
        var context = TestDbContextFactory.Create();
        var uow = new UnitOfWork(context);
        fileServiceMock ??= new Mock<IFileService>();
        var service = new AssignmentService(uow, fileServiceMock.Object);
        return (service, uow);
    }

    private static async Task<(ClassCourse classCourse, Subject subject)> SeedClassAndSubjectAsync(UnitOfWork uow, string teacherId)
    {
        var classCourse = new ClassCourse { Name = "Grade 10 - A" };
        await uow.ClassCourses.AddAsync(classCourse);
        await uow.SaveChangesAsync();

        var subject = new Subject { Name = "Mathematics", ClassCourseId = classCourse.Id };
        await uow.Subjects.AddAsync(subject);
        await uow.SaveChangesAsync();

        await uow.TeacherSubjectAssignments.AddAsync(new TeacherSubjectAssignment { TeacherId = teacherId, SubjectId = subject.Id });
        await uow.SaveChangesAsync();

        return (classCourse, subject);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_CreatesPublishedAssignment()
    {
        var (service, uow) = CreateService();
        const string teacherId = "teacher-1";
        var (classCourse, subject) = await SeedClassAndSubjectAsync(uow, teacherId);

        var dto = new CreateAssignmentDto
        {
            Title = "Algebra Homework",
            Description = "Solve chapter 3 exercises.",
            DeadlineUtc = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id,
            Publish = true
        };

        var result = await service.CreateAsync(teacherId, dto);

        result.Title.Should().Be("Algebra Homework");
        result.Status.Should().Be(AssignmentStatus.Published.ToString());
        result.TeacherId.Should().Be(teacherId);
    }

    [Fact]
    public async Task CreateAsync_WhenTeacherNotAssignedToSubject_ThrowsForbidden()
    {
        var (service, uow) = CreateService();
        var (classCourse, subject) = await SeedClassAndSubjectAsync(uow, "some-other-teacher");

        var dto = new CreateAssignmentDto
        {
            Title = "Algebra Homework",
            Description = "Solve chapter 3 exercises.",
            DeadlineUtc = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        };

        Func<Task> act = () => service.CreateAsync("teacher-not-assigned", dto);

        await act.Should().ThrowAsync<ForbiddenAccessException>();
    }

    [Fact]
    public async Task CreateAsync_WithoutDescriptionOrFile_ThrowsBadRequest()
    {
        var (service, uow) = CreateService();
        const string teacherId = "teacher-1";
        var (classCourse, subject) = await SeedClassAndSubjectAsync(uow, teacherId);

        var dto = new CreateAssignmentDto
        {
            Title = "Empty assignment",
            Description = null,
            DeadlineUtc = DateTime.UtcNow.AddDays(1),
            MaxMarks = 50,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        };

        Func<Task> act = () => service.CreateAsync(teacherId, dto);

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GetForStudentAsync_OnlyReturnsPublishedAssignmentsForEnrolledClasses()
    {
        var (service, uow) = CreateService();
        const string teacherId = "teacher-1";
        const string studentId = "student-1";
        var (classCourse, subject) = await SeedClassAndSubjectAsync(uow, teacherId);

        await uow.StudentClassEnrollments.AddAsync(new StudentClassEnrollment { StudentId = studentId, ClassCourseId = classCourse.Id });

        await uow.Assignments.AddAsync(new Assignment
        {
            Title = "Published one",
            Description = "desc",
            DeadlineUtc = DateTime.UtcNow.AddDays(2),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            TeacherId = teacherId,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        });

        await uow.Assignments.AddAsync(new Assignment
        {
            Title = "Draft one",
            Description = "desc",
            DeadlineUtc = DateTime.UtcNow.AddDays(2),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            TeacherId = teacherId,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        });

        await uow.SaveChangesAsync();

        var result = await service.GetForStudentAsync(studentId);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Published one");
    }
}
