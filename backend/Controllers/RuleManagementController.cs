using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutomotiveClaimsApi.Data;
using AutomotiveClaimsApi.DTOs;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RuleManagementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RuleManagementController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Task Templates
        [HttpGet("task-templates")]
        public async Task<ActionResult<IEnumerable<TaskTemplateDto>>> GetTaskTemplates()
        {
            var templates = await _context.TaskTemplates.AsNoTracking().ToListAsync();
            return templates.Select(MapTaskTemplateToDto).ToList();
        }

        [HttpPost("task-templates")]
        public async Task<ActionResult<TaskTemplateDto>> CreateTaskTemplate([FromBody] TaskTemplateUpsertDto dto)
        {
            var entity = new TaskTemplate
            {
                Id = Guid.NewGuid(),
                Name = dto.Name ?? string.Empty,
                Description = dto.Description,
                Channel = dto.Channel,
                Recipients = dto.Recipients != null ? string.Join(",", dto.Recipients) : string.Empty,
                CronExpression = dto.CronExpression
            };
            _context.TaskTemplates.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTaskTemplates), new { id = entity.Id }, MapTaskTemplateToDto(entity));
        }

        [HttpPut("task-templates/{id}")]
        public async Task<ActionResult<TaskTemplateDto>> UpdateTaskTemplate(Guid id, [FromBody] TaskTemplateUpsertDto dto)
        {
            var entity = await _context.TaskTemplates.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Name = dto.Name ?? entity.Name;
            entity.Description = dto.Description ?? entity.Description;
            entity.Channel = dto.Channel;
            entity.Recipients = dto.Recipients != null ? string.Join(",", dto.Recipients) : entity.Recipients;
            entity.CronExpression = dto.CronExpression;

            await _context.SaveChangesAsync();
            return MapTaskTemplateToDto(entity);
        }

        [HttpDelete("task-templates/{id}")]
        public async Task<IActionResult> DeleteTaskTemplate(Guid id)
        {
            var entity = await _context.TaskTemplates.FindAsync(id);
            if (entity == null) return NotFound();
            _context.TaskTemplates.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Notification Templates
        [HttpGet("notification-templates")]
        public async Task<ActionResult<IEnumerable<NotificationTemplateDto>>> GetNotificationTemplates()
        {
            var templates = await _context.NotificationTemplates.AsNoTracking().ToListAsync();
            return templates.Select(MapNotificationTemplateToDto).ToList();
        }

        [HttpPost("notification-templates")]
        public async Task<ActionResult<NotificationTemplateDto>> CreateNotificationTemplate([FromBody] NotificationTemplateUpsertDto dto)
        {
            var entity = new NotificationTemplate
            {
                Id = Guid.NewGuid(),
                Name = dto.Name ?? string.Empty,
                Subject = dto.Subject ?? string.Empty,
                Body = dto.Body ?? string.Empty,
                Channel = dto.Channel,
                Recipients = dto.Recipients != null ? string.Join(",", dto.Recipients) : string.Empty
            };
            _context.NotificationTemplates.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotificationTemplates), new { id = entity.Id }, MapNotificationTemplateToDto(entity));
        }

        [HttpPut("notification-templates/{id}")]
        public async Task<ActionResult<NotificationTemplateDto>> UpdateNotificationTemplate(Guid id, [FromBody] NotificationTemplateUpsertDto dto)
        {
            var entity = await _context.NotificationTemplates.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Name = dto.Name ?? entity.Name;
            entity.Subject = dto.Subject ?? entity.Subject;
            entity.Body = dto.Body ?? entity.Body;
            entity.Channel = dto.Channel;
            entity.Recipients = dto.Recipients != null ? string.Join(",", dto.Recipients) : entity.Recipients;

            await _context.SaveChangesAsync();
            return MapNotificationTemplateToDto(entity);
        }

        [HttpDelete("notification-templates/{id}")]
        public async Task<IActionResult> DeleteNotificationTemplate(Guid id)
        {
            var entity = await _context.NotificationTemplates.FindAsync(id);
            if (entity == null) return NotFound();
            _context.NotificationTemplates.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Event Rules
        [HttpGet("event-rules")]
        public async Task<ActionResult<IEnumerable<EventRuleDto>>> GetEventRules()
        {
            var rules = await _context.EventRules.AsNoTracking().ToListAsync();
            return rules.Select(MapEventRuleToDto).ToList();
        }

        [HttpPost("event-rules")]
        public async Task<ActionResult<EventRuleDto>> CreateEventRule([FromBody] EventRuleUpsertDto dto)
        {
            var entity = new EventRule
            {
                Id = Guid.NewGuid(),
                Name = dto.Name ?? string.Empty,
                EventType = dto.EventType,
                TaskTemplateId = dto.TaskTemplateId,
                NotificationTemplateId = dto.NotificationTemplateId,
                CronExpression = dto.CronExpression
            };
            _context.EventRules.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEventRules), new { id = entity.Id }, MapEventRuleToDto(entity));
        }

        [HttpPut("event-rules/{id}")]
        public async Task<ActionResult<EventRuleDto>> UpdateEventRule(Guid id, [FromBody] EventRuleUpsertDto dto)
        {
            var entity = await _context.EventRules.FindAsync(id);
            if (entity == null) return NotFound();

            entity.Name = dto.Name ?? entity.Name;
            entity.EventType = dto.EventType ?? entity.EventType;
            entity.TaskTemplateId = dto.TaskTemplateId;
            entity.NotificationTemplateId = dto.NotificationTemplateId;
            entity.CronExpression = dto.CronExpression;

            await _context.SaveChangesAsync();
            return MapEventRuleToDto(entity);
        }

        [HttpDelete("event-rules/{id}")]
        public async Task<IActionResult> DeleteEventRule(Guid id)
        {
            var entity = await _context.EventRules.FindAsync(id);
            if (entity == null) return NotFound();
            _context.EventRules.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static TaskTemplateDto MapTaskTemplateToDto(TaskTemplate t) => new()
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Channel = t.Channel,
            CronExpression = t.CronExpression,
            Recipients = string.IsNullOrEmpty(t.Recipients) ? new List<string>() : t.Recipients.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        };

        private static NotificationTemplateDto MapNotificationTemplateToDto(NotificationTemplate t) => new()
        {
            Id = t.Id,
            Name = t.Name,
            Subject = t.Subject,
            Body = t.Body,
            Channel = t.Channel,
            Recipients = string.IsNullOrEmpty(t.Recipients) ? new List<string>() : t.Recipients.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        };

        private static EventRuleDto MapEventRuleToDto(EventRule r) => new()
        {
            Id = r.Id,
            Name = r.Name,
            EventType = r.EventType,
            TaskTemplateId = r.TaskTemplateId,
            NotificationTemplateId = r.NotificationTemplateId,
            CronExpression = r.CronExpression
        };
    }
}
