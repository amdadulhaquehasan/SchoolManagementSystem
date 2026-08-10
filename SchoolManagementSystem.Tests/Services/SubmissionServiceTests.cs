using FluentAssertions;
using Moq;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Business.Services;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Implementations;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Domain.Enums;
using SchoolManagementSystem.Presentation.DTOs.Submissions;
using SchoolManagementSystem.Tests.Helpers;
using Xunit;

namespace SchoolManagementSystem.Tests.Services;

public class SubmissionServiceTests
{
    private const string TeacherId = "teacher-1";
    private const string StudentId = "student-1";

    private static (SubmissionService service, UnitOfWork uow, Mock<IFileService> fileServiceMock) CreateService()
    {
        var context = TestDbContextFactory.Create();
        var uow = new UnitOfWork(context);
        var fileServiceMock = new Mock<IFileService>();
        var service = new SubmissionService(uow, fileServiceMock.Object);
        return (service, uow, fileServiceMock);
    }

    private static async Task<Assignment> SeedPublishedAssignmentAsync(UnitOfWork uow, DateTime deadline, bool enrollStudent = true)
    {
        var classCourse = new ClassCourse { Name = "Grade 10 - A" };
        await uow.ClassCourses.AddAsync(classCourse);
        await uow.SaveChangesAsync();

        var subject = new Subject { Name = "Mathematics", ClassCourseId = classCourse.Id };
        await uow.Subjects.AddAsync(subject);
        await uow.SaveChangesAsync();

        if (enrollStudent)
        {
            await uow.StudentClassEnrollments.AddAsync(new StudentClassEnrollment { StudentId = StudentId, ClassCourseId = classCourse.Id });
        }

        var assignment = new Assignment
        {
            Title = "Algebra Homework",
            Description = "Solve chapter 3.",
            DeadlineUtc = deadline,
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            TeacherId = TeacherId,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        };
        await uow.Assignments.AddAsync(assignment);
        await uow.SaveChangesAsync();

        return assignment;
    }

    [Fact]
    public async Task SubmitAsync_WithTextAnswer_CreatesSubmittedStatus()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddDays(2));

        var result = await service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "My answer" });

        result.Status.Should().Be(SubmissionStatus.Submitted.ToString());
        result.TextAnswer.Should().Be("My answer");
    }

    [Fact]
    public async Task SubmitAsync_AfterDeadline_MarksAsLate()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddSeconds(-1));

        var result = await service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "Late answer" });

        result.Status.Should().Be(SubmissionStatus.Late.ToString());
    }

    [Fact]
    public async Task SubmitAsync_WhenStudentNotEnrolled_ThrowsForbidden()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddDays(2), enrollStudent: false);

        Func<Task> act = () => service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "answer" });

        await act.Should().ThrowAsync<ForbiddenAccessException>();
    }

    [Fact]
    public async Task SubmitAsync_WithoutTextOrFile_ThrowsBadRequest()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddDays(2));

        Func<Task> act = () => service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto());

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task UpdateAsync_AfterDeadline_ThrowsBadRequest()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddSeconds(2));

        var submission = await service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "answer" });

        await Task.Delay(2500);

        Func<Task> act = () => service.UpdateAsync(submission.Id, StudentId, new UpdateSubmissionDto { TextAnswer = "updated" });

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GradeAsync_WithMarksAboveMax_ThrowsBadRequest()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddDays(2));
        var submission = await service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "answer" });

        Func<Task> act = () => service.GradeAsync(submission.Id, TeacherId, new GradeSubmissionDto { MarksObtained = 999 });

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GradeAsync_ByNonOwningTeacher_ThrowsForbidden()
    {
        var (service, uow, _) = CreateService();
        var assignment = await SeedPublishedAssignmentAsync(uow, DateTime.UtcNow.AddDays(2));
        var submission = await service.SubmitAsync(assignment.Id, StudentId, new CreateSubmissionDto { TextAnswer = "answer" });

        Func<Task> act = () => service.GradeAsync(submission.Id, "another-teacher", new GradeSubmissionDto { MarksObtained = 80 });

        await act.Should().ThrowAsync<ForbiddenAccessException>();
    }
}
