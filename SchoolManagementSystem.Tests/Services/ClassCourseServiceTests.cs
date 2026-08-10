using FluentAssertions;
using SchoolManagementSystem.Business.Services;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Implementations;
using SchoolManagementSystem.Presentation.DTOs.ClassCourses;
using SchoolManagementSystem.Tests.Helpers;
using Xunit;

namespace SchoolManagementSystem.Tests.Services;

public class ClassCourseServiceTests
{
    private static (ClassCourseService service, UnitOfWork uow) CreateService()
    {
        var context = TestDbContextFactory.Create();
        var uow = new UnitOfWork(context);
        return (new ClassCourseService(uow), uow);
    }

    [Fact]
    public async Task CreateAsync_WithUniqueName_Succeeds()
    {
        var (service, _) = CreateService();

        var result = await service.CreateAsync(new CreateClassCourseDto { Name = "Grade 10 - A", Description = "Section A" });

        result.Id.Should().BeGreaterThan(0);
        result.Name.Should().Be("Grade 10 - A");
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateName_ThrowsBadRequest()
    {
        var (service, _) = CreateService();
        await service.CreateAsync(new CreateClassCourseDto { Name = "Grade 10 - A" });

        Func<Task> act = () => service.CreateAsync(new CreateClassCourseDto { Name = "Grade 10 - A" });

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task EnrollStudentAsync_WhenAlreadyEnrolled_ThrowsBadRequest()
    {
        var (service, _) = CreateService();
        var classCourse = await service.CreateAsync(new CreateClassCourseDto { Name = "Grade 10 - A" });

        await service.EnrollStudentAsync(classCourse.Id, "student-1");

        Func<Task> act = () => service.EnrollStudentAsync(classCourse.Id, "student-1");

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ThrowsNotFound()
    {
        var (service, _) = CreateService();

        Func<Task> act = () => service.GetByIdAsync(999);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
