using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Context;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<ClassCourse> ClassCourses => Set<ClassCourse>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<TeacherSubjectAssignment> TeacherSubjectAssignments => Set<TeacherSubjectAssignment>();
    public DbSet<StudentClassEnrollment> StudentClassEnrollments => Set<StudentClassEnrollment>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);


        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<IdentityRole>().ToTable("Roles");
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");


        builder.Entity<ClassCourse>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.HasIndex(x => x.Name).IsUnique();
        });


        builder.Entity<Subject>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.HasOne(x => x.ClassCourse)
                .WithMany(c => c.Subjects)
                .HasForeignKey(x => x.ClassCourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        builder.Entity<TeacherSubjectAssignment>(e =>
        {
            e.HasOne(x => x.Teacher)
                .WithMany(t => t.TeacherSubjectAssignments)
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Subject)
                .WithMany(s => s.TeacherAssignments)
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.TeacherId, x.SubjectId }).IsUnique();
        });


        builder.Entity<StudentClassEnrollment>(e =>
        {
            e.HasOne(x => x.Student)
                .WithMany(s => s.StudentClassEnrollments)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.ClassCourse)
                .WithMany(c => c.StudentEnrollments)
                .HasForeignKey(x => x.ClassCourseId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.StudentId, x.ClassCourseId }).IsUnique();
        });


        builder.Entity<Assignment>(e =>
        {
            e.Property(x => x.Title).IsRequired().HasMaxLength(300);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

            e.HasOne(x => x.Teacher)
                .WithMany(t => t.CreatedAssignments)
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(x => x.SubjectId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.ClassCourse)
                .WithMany(c => c.Assignments)
                .HasForeignKey(x => x.ClassCourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        builder.Entity<Submission>(e =>
        {
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

            e.HasOne(x => x.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(x => x.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Student)
                .WithMany(s => s.Submissions)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AssignmentId, x.StudentId }).IsUnique();
        });
    }
}
