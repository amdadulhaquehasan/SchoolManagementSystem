namespace SchoolManagementSystem.DataAccess.Exceptions;

public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}
