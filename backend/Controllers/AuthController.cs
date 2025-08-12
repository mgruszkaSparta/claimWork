using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using AutomotiveClaimsApi.Models;
using AutomotiveClaimsApi.Services;

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
    }
}
