using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _context;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListItemDto>>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = null,
            [FromQuery] string sortOrder = "asc")
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    (u.UserName != null && u.UserName.Contains(search)) ||
                    (u.Email != null && u.Email.Contains(search)) ||
                    (u.FirstName != null && u.FirstName.Contains(search)) ||
                    (u.LastName != null && u.LastName.Contains(search)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                bool active = status.ToLower() == "active";
                query = query.Where(u => u.IsActive == active);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                var roleEntity = await _roleManager.FindByNameAsync(role);
                if (roleEntity != null)
                {
                    var userIds = _context.UserRoles
                        .Where(ur => ur.RoleId == roleEntity.Id)
                        .Select(ur => ur.UserId);
                    query = query.Where(u => userIds.Contains(u.Id));
                }
            }

            query = sortBy?.ToLower() switch
            {
                "firstname" => sortOrder == "desc" ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
                "lastname" => sortOrder == "desc" ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
                "email" => sortOrder == "desc" ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                _ => sortOrder == "desc" ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName)
            };

            var totalCount = await query.CountAsync();
            var users = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            var result = new List<UserListItemDto>();
            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new UserListItemDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Role = roles.FirstOrDefault(),
                    Status = u.IsActive ? "active" : "inactive"
                });
            }

            Response.Headers["X-Total-Count"] = totalCount.ToString();
            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Roles = roles,
                IsActive = user.IsActive
            };
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password!);
            if (!result.Succeeded) return BadRequest(result.Errors);

            if (dto.Roles != null && dto.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, dto.Roles);
            }

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, null);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            if (dto.UserName != null) user.UserName = dto.UserName;
            if (dto.Email != null) user.Email = dto.Email;
            if (dto.FirstName != null) user.FirstName = dto.FirstName;
            if (dto.LastName != null) user.LastName = dto.LastName;
            if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
            if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded) return BadRequest(updateResult.Errors);

            if (dto.Roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                var rolesToAdd = dto.Roles.Except(currentRoles);
                var rolesToRemove = currentRoles.Except(dto.Roles);
                if (rolesToAdd.Any()) await _userManager.AddToRolesAsync(user, rolesToAdd);
                if (rolesToRemove.Any()) await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return NoContent();
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> Bulk([FromBody] BulkUpdateUsersDto dto)
        {
            foreach (var userId in dto.UserIds)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) continue;

                switch (dto.Action)
                {
                    case "activate":
                        user.IsActive = true;
                        await _userManager.UpdateAsync(user);
                        break;
                    case "deactivate":
                        user.IsActive = false;
                        await _userManager.UpdateAsync(user);
                        break;
                    case "assignRole":
                        if (!string.IsNullOrEmpty(dto.Role) && !await _userManager.IsInRoleAsync(user, dto.Role))
                        {
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
