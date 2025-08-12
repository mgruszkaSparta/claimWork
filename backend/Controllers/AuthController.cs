using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.DTOs;
using Microsoft.AspNetCore.Http;


namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IEmailSender? _emailSender;

        public AuthController(UserManager<ApplicationUser> userManager, IEmailSender? emailSender = null)
        {
            _userManager = userManager;
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

        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IAntiforgery _antiforgery;

        public AuthController(UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IAntiforgery antiforgery)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _antiforgery = antiforgery;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto.UserName == null || dto.Password == null)
                return BadRequest();

            var user = new ApplicationUser { UserName = dto.UserName, Email = dto.Email };
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto.UserName == null || dto.Password == null)
                return BadRequest();

            var result = await _signInManager.PasswordSignInAsync(dto.UserName, dto.Password, true, true);
            if (!result.Succeeded)
            {
                return Unauthorized();
            }
            return Ok();
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> Me()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto { Id = user.Id, UserName = user.UserName, Email = user.Email, Roles = roles };
        }

        [AllowAnonymous]
        [HttpGet("antiforgery")]
        public IActionResult Antiforgery()
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions { HttpOnly = false });
            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            // In real implementation email with token would be sent
            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDto dto)
        {
            // In real implementation password would be reset using provided token
            return NoContent();
        }

        [Authorize]
        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto { Id = user.Id, UserName = user.UserName, Email = user.Email, Roles = roles };
        }

        [Authorize]
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            if (dto.UserName != null) user.UserName = dto.UserName;
            if (dto.Email != null) user.Email = dto.Email;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return NoContent();
        }

    }
}
