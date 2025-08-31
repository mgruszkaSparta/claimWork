using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Services;
using AutomotiveClaimsApi.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.Text;
namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailSender? _emailSender;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ILogger<AuthController> logger,
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailSender? emailSender = null)
        {
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _configuration = configuration;
            _emailSender = emailSender;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok(new { message = "If the email is registered, a reset link has been sent." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            if (_emailSender != null)
            {
                await _emailSender.SendEmailAsync(model.Email, "Password Reset", token);
                return Ok(new { message = "Password reset token sent." });
            }

            // For local testing, return the token
            return Ok(new { token });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Invalid email." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (result.Succeeded)
            {
                return Ok(new { message = "Password has been reset." });
            }

            return BadRequest(result.Errors);
        }

        public record ForgotPasswordDto(string Email);
        public record ResetPasswordDto(string Email, string Token, string NewPassword);

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto.UserName == null || dto.Password == null)
                return BadRequest();

            var user = new ApplicationUser { UserName = dto.UserName, Email = dto.Email, MustChangePassword = true , CreatedAt = DateTime.UtcNow, CaseHandlerId = dto.CaseHandlerId };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            if (!string.IsNullOrEmpty(dto.Role))
            {
                var roleResult = await _userManager.AddToRoleAsync(user, dto.Role);
                if (!roleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);
                    return BadRequest(roleResult.Errors);
                }
            }

            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto.UserName == null || dto.Password == null)
            {
                _logger.LogWarning("Login attempt with missing username or password");
                return BadRequest(new { message = "Username and password are required." });
            }
            var user = await _userManager.FindByNameAsync(dto.UserName);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                return Unauthorized();
            }

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(1), signingCredentials: creds);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString, mustChangePassword = user.MustChangePassword });
        }

        [Authorize]
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
            };
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(1), signingCredentials: creds);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { token = tokenString });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok();
        }

        [Authorize]
        [HttpPost("force-change-password")]
        public async Task<IActionResult> ForceChangePassword([FromBody] ForceChangePasswordDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            user.MustChangePassword = false;
            await _userManager.UpdateAsync(user);

            return Ok();
        }

        public record ForceChangePasswordDto(string CurrentPassword, string NewPassword);

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> Me()
        {
            var userId = _userManager.GetUserId(User);
            var user = await _userManager.Users
                .Include(u => u.UserClients)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Roles = roles,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                FullAccess = user.FullAccess,
                ClientIds = user.UserClients.Select(uc => uc.ClientId),
                CaseHandlerId = user.CaseHandlerId
            };
        }

        [Authorize]
        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _userManager.Users
                .Include(u => u.UserClients)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Roles = roles,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                FullAccess = user.FullAccess,
                ClientIds = user.UserClients.Select(uc => uc.ClientId),
                CaseHandlerId = user.CaseHandlerId
            };
        }

        [Authorize]
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            if (dto.UserName != null) user.UserName = dto.UserName;
            if (dto.Email != null) user.Email = dto.Email;
            if (dto.FullAccess.HasValue) user.FullAccess = dto.FullAccess.Value;
            if (dto.CaseHandlerId.HasValue) user.CaseHandlerId = dto.CaseHandlerId;

            if (dto.ClientIds != null)
            {
                var existing = _context.UserClients.Where(uc => uc.UserId == user.Id);
                _context.UserClients.RemoveRange(existing);
                foreach (var clientId in dto.ClientIds.Distinct())
                {
                    _context.UserClients.Add(new UserClient { UserId = user.Id, ClientId = clientId });
                }
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            if (!string.IsNullOrEmpty(dto.Role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (currentRoles.Count > 0)
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                }
                await _userManager.AddToRoleAsync(user, dto.Role);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserListItemDto>>> GetUsers([FromQuery] string? search)
        {
            var query = _userManager.Users.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    u.UserName!.Contains(search) ||
                    (u.Email != null && u.Email.Contains(search)));
            }

            var users = await query.ToListAsync();
            var items = new List<UserListItemDto>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                items.Add(new UserListItemDto
                {
                    Id = u.Id,
                    FirstName = u.UserName,
                    LastName = string.Empty,
                    Email = u.Email,
                    Role = roles.FirstOrDefault(),
                    Status = u.LockoutEnd.HasValue && u.LockoutEnd.Value.UtcDateTime > DateTime.UtcNow ? "inactive" : "active",
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin,
                    CaseHandlerId = u.CaseHandlerId
                });
            }

            Response.Headers["X-Total-Count"] = items.Count.ToString();
            return Ok(items);
        }

        [Authorize]
        [HttpGet("users/check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            var exists = await _userManager.FindByEmailAsync(email) != null;
            return Ok(new { exists });
        }

        [Authorize]
        [HttpPost("users/bulk")]
        public async Task<IActionResult> UpdateUsersBulk([FromBody] UpdateUsersBulkDto dto)
        {
            foreach (var id in dto.UserIds)
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null) continue;

                switch (dto.Action)
                {
                    case "activate":
                        user.LockoutEnd = null;
                        await _userManager.UpdateAsync(user);
                        break;
                    case "deactivate":
                        user.LockoutEnd = DateTimeOffset.MaxValue;
                        await _userManager.UpdateAsync(user);
                        break;
                    case "assignRole":
                        if (!string.IsNullOrEmpty(dto.Role))
                        {
                            var currentRoles = await _userManager.GetRolesAsync(user);
                            if (currentRoles.Count > 0)
                                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                            await _userManager.AddToRoleAsync(user, dto.Role);
                        }
                        break;
                    case "delete":
                        await _userManager.DeleteAsync(user);
                        break;
                }
            }

            return NoContent();
        }

    }
}
