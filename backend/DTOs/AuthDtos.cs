namespace AutomotiveClaimsApi.DTOs
{
    public class RegisterDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    public class LoginDto
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
    }

    public class ForgotPasswordDto
    {
        public string? Email { get; set; }
    }

    public class ResetPasswordDto
    {
        public string? Email { get; set; }
        public string? Token { get; set; }
        public string? Password { get; set; }
    }

    public class UpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
    }

    public class UserDto
    {
        public string? Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public IEnumerable<string>? Roles { get; set; }
    }
}
