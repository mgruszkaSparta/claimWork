using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using AutomotiveClaimsApi.Data;

namespace AutomotiveClaimsApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("metadata")]
        public IActionResult GetMetadata()
        {
            var dbSets = typeof(ApplicationDbContext).GetProperties()
                .Where(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericTypeDefinition() == typeof(DbSet<>));

            var result = new Dictionary<string, IEnumerable<string>>();

            foreach (var dbSet in dbSets)
            {
                var entityType = dbSet.PropertyType.GetGenericArguments()[0];
                var fields = entityType.GetProperties()
                    .Where(pi => pi.PropertyType.IsPrimitive || pi.PropertyType == typeof(string) || pi.PropertyType == typeof(DateTime) || pi.PropertyType == typeof(DateTime?))
                    .Select(pi => pi.Name)
                    .ToList();
                result[entityType.Name] = fields;
            }

            return Ok(result);
        }

        [HttpGet("values")]
        public IActionResult GetFieldValues([FromQuery] string entity, [FromQuery] string field)
        {
            if (string.IsNullOrEmpty(entity) || string.IsNullOrEmpty(field))
                return BadRequest();

            var dbSetProperty = typeof(ApplicationDbContext).GetProperties()
                .FirstOrDefault(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericArguments()[0].Name == entity);
            if (dbSetProperty == null)
                return NotFound();

            var entityType = dbSetProperty.PropertyType.GetGenericArguments()[0];
            var prop = entityType.GetProperty(field);
            if (prop == null)
                return NotFound();

            var setMethod = typeof(ApplicationDbContext).GetMethods()
                .First(m => m.Name == "Set" && m.IsGenericMethod && m.GetParameters().Length == 0);
            var queryable = (IQueryable)setMethod.MakeGenericMethod(entityType).Invoke(_context, null)!;
            var values = queryable.Cast<object>()
                .Select(e => prop.GetValue(e)?.ToString())
                .Where(v => !string.IsNullOrEmpty(v))
                .Distinct()
                .ToList();

            return Ok(values);
        }

        [HttpPost("export")]
        public IActionResult Export([FromBody] ReportRequest request)
        {
            if (string.IsNullOrEmpty(request.Entity))
                return BadRequest("Entity is required");

            var dbSetProperty = typeof(ApplicationDbContext).GetProperties()
                .FirstOrDefault(p => p.PropertyType.IsGenericType && p.PropertyType.GetGenericArguments()[0].Name == request.Entity);
            if (dbSetProperty == null)
                return NotFound();

            var entityType = dbSetProperty.PropertyType.GetGenericArguments()[0];
            var setMethod = typeof(ApplicationDbContext).GetMethods()
                .First(m => m.Name == "Set" && m.IsGenericMethod && m.GetParameters().Length == 0);
            var queryable = (IQueryable)setMethod.MakeGenericMethod(entityType).Invoke(_context, null)!;
            var data = queryable.Cast<object>().ToList();

            if (request.Filters != null)
            {
                foreach (var filter in request.Filters)
                {
                    var prop = entityType.GetProperty(filter.Key);
                    if (prop != null)
                    {
                        data = data.Where(d => (prop.GetValue(d)?.ToString() ?? "") == filter.Value).ToList();
                    }
                }
            }
            if (request.FromDate != null)
            {
                var dateProp = entityType.GetProperty("DamageDate") ?? entityType.GetProperty("CreatedAt");
                if (dateProp != null)
                {
                    data = data.Where(d =>
                    {
                        var val = dateProp.GetValue(d) as DateTime?;
                        return val != null && val >= request.FromDate;
                    }).ToList();
                }
            }
            if (request.ToDate != null)
            {
                var dateProp = entityType.GetProperty("DamageDate") ?? entityType.GetProperty("CreatedAt");
                if (dateProp != null)
                {
                    data = data.Where(d =>
                    {
                        var val = dateProp.GetValue(d) as DateTime?;
                        return val != null && val <= request.ToDate;
                    }).ToList();
                }
            }

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Report");
            for (int i = 0; i < request.Fields.Count; i++)
            {
                worksheet.Cell(1, i + 1).Value = request.Fields[i];
            }
            for (int row = 0; row < data.Count; row++)
            {
                for (int col = 0; col < request.Fields.Count; col++)
                {
                    var prop = entityType.GetProperty(request.Fields[col]);
                    if (prop != null)
                    {
                        var value = prop.GetValue(data[row]);
                        worksheet.Cell(row + 2, col + 1).Value = value?.ToString();
                    }
                }
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;
            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "report.xlsx");
        }
    }

    public class ReportRequest
    {
        public string Entity { get; set; } = string.Empty;
        public List<string> Fields { get; set; } = new();
        public Dictionary<string, string>? Filters { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
