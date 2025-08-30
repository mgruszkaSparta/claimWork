using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AutomotiveClaimsApi.DTOs
{
    public class RegisterDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        [JsonPropertyName("role")]
        public string? Role { get; set; }
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
        public bool? FullAccess { get; set; }
        public IEnumerable<int>? ClientIds { get; set; }
        [JsonPropertyName("role")]
        public string? Role { get; set; }
    }

    public class UserDto
    {
        public string? Id { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public IEnumerable<string>? Roles { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool FullAccess { get; set; }
        public IEnumerable<int> ClientIds { get; set; } = Array.Empty<int>();
    }

    public class UserListItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        [JsonPropertyName("role")]
        public string? Role { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
    }

    public class UpdateUsersBulkDto
    {
        public IEnumerable<string> UserIds { get; set; } = Array.Empty<string>();
        public string Action { get; set; } = string.Empty;
        [JsonPropertyName("role")]
        public string? Role { get; set; }
    }
}
