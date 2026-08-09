namespace SchoolManagementSystem.DataAccess.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string message = "You are not allowed to perform this action.") : base(message) { }
}
