using System;
using System.Data.Common;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Diagnostics;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Data
{
    public class RReportCommandInterceptor : DbCommandInterceptor
    {
        public override InterceptionResult<DbDataReader> ReaderExecuting(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result)
        {
            LogSelect(command, eventData);
            return base.ReaderExecuting(command, eventData, result);
        }

        private void LogSelect(DbCommand command, CommandEventData eventData)
        {
            var sql = command.CommandText?.TrimStart();
            if (sql?.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) == true &&
                eventData.Context is ApplicationDbContext ctx)
            {
                var parameters = command.Parameters
                    .Cast<DbParameter>()
                    .ToDictionary(p => p.ParameterName, p => p.Value);

                ctx.RReports.Add(new RReport
                {
                    TableName = ExtractTableName(sql),
                    RecordId = string.Empty,
                    Operation = "Select",
                    Data = JsonSerializer.Serialize(new { command.CommandText, Parameters = parameters }),
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        private static string ExtractTableName(string sql)
        {
            var match = Regex.Match(sql, "from\\s+([\\w\\[\\].`\"-]+)", RegexOptions.IgnoreCase);
            return match.Success ? match.Groups[1].Value : string.Empty;
        }
    }
}
