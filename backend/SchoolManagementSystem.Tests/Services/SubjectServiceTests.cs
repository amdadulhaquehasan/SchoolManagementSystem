using FluentAssertions;
using Moq;
using SchoolManagementSystem.Business.Services;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Implementations;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Presentation.DTOs.Subjects;
using SchoolManagementSystem.Tests.Helpers;
using Xunit;

namespace SchoolManagementSystem.Tests.Services;

public class SubjectServiceTests
{
    [Fact]
    public async Task CreateAsync_WithUnknownClassCourse_ThrowsNotFound()
    {
        var uow = new UnitOfWork(TestDbContextFactory.Create());
        var userManagerMock = MockUserManagerFactory.Create();
        var service = new SubjectService(uow, userManagerMock.Object);

        Func<Task> act = () => service.CreateAsync(new CreateSubjectDto { Name = "Math", ClassCourseId = 999 });

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AssignTeacherAsync_WhenUserIsNotATeacher_ThrowsBadRequest()
    {
        var context = TestDbContextFactory.Create();
        var uow = new UnitOfWork(context);

        var classCourse = new ClassCourse { Name = "Grade 10 - A" };
        await uow.ClassCourses.AddAsync(classCourse);
        await uow.SaveChangesAsync();

        var subject = new Subject { Name = "Math", ClassCourseId = classCourse.Id };
        await uow.Subjects.AddAsync(subject);
        await uow.SaveChangesAsync();

        var userManagerMock = MockUserManagerFactory.Create();
        var notATeacher = new ApplicationUser { Id = "student-1", Email = "s@x.com" };
        userManagerMock.Setup(m => m.FindByIdAsync("student-1")).ReturnsAsync(notATeacher);
        userManagerMock.Setup(m => m.IsInRoleAsync(notATeacher, AppRoles.Teacher)).ReturnsAsync(false);

        var service = new SubjectService(uow, userManagerMock.Object);

        Func<Task> act = () => service.AssignTeacherAsync(subject.Id, "student-1");

        await act.Should().ThrowAsync<BadRequestException>();
    }
}
