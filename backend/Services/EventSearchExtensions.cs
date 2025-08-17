using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services
{
    public static class EventSearchExtensions
    {
        public static IQueryable<Event> ApplySearch(this IQueryable<Event> query, string search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return query;
            }

            var parameter = Expression.Parameter(typeof(Event), "e");
            var searchLower = Expression.Constant(search.ToLower());
            var toLower = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!;
            var contains = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) })!;

            Expression? body = null;

            foreach (var prop in typeof(Event).GetProperties().Where(p => p.PropertyType == typeof(string)))
            {
                var propExp = Expression.Property(parameter, prop);
                var notNull = Expression.NotEqual(propExp, Expression.Constant(null, typeof(string)));
                var toLowerCall = Expression.Call(propExp, toLower);
                var containsCall = Expression.Call(toLowerCall, contains, searchLower);
                var predicate = Expression.AndAlso(notNull, containsCall);
                body = body == null ? predicate : Expression.OrElse(body, predicate);
            }

            // Notes
            var noteParam = Expression.Parameter(typeof(Note), "n");
            Expression? noteBody = null;
            foreach (var prop in typeof(Note).GetProperties().Where(p => p.PropertyType == typeof(string)))
            {
                var propExp = Expression.Property(noteParam, prop);
                var notNull = Expression.NotEqual(propExp, Expression.Constant(null, typeof(string)));
                var toLowerCall = Expression.Call(propExp, toLower);
                var containsCall = Expression.Call(toLowerCall, contains, searchLower);
                var predicate = Expression.AndAlso(notNull, containsCall);
                noteBody = noteBody == null ? predicate : Expression.OrElse(noteBody, predicate);
            }
            if (noteBody != null)
            {
                var anyNotes = Expression.Call(
                    typeof(Enumerable), nameof(Enumerable.Any), new[] { typeof(Note) },
                    Expression.Property(parameter, nameof(Event.Notes)),
                    Expression.Lambda<Func<Note, bool>>(noteBody, noteParam));
                body = body == null ? anyNotes : Expression.OrElse(body, anyNotes);
            }

            // Documents
            var docParam = Expression.Parameter(typeof(Document), "d");
            Expression? docBody = null;
            foreach (var prop in typeof(Document).GetProperties().Where(p => p.PropertyType == typeof(string)))
            {
                var propExp = Expression.Property(docParam, prop);
                var notNull = Expression.NotEqual(propExp, Expression.Constant(null, typeof(string)));
                var toLowerCall = Expression.Call(propExp, toLower);
                var containsCall = Expression.Call(toLowerCall, contains, searchLower);
                var predicate = Expression.AndAlso(notNull, containsCall);
                docBody = docBody == null ? predicate : Expression.OrElse(docBody, predicate);
            }
            if (docBody != null)
            {
                var anyDocs = Expression.Call(
                    typeof(Enumerable), nameof(Enumerable.Any), new[] { typeof(Document) },
                    Expression.Property(parameter, nameof(Event.Documents)),
                    Expression.Lambda<Func<Document, bool>>(docBody, docParam));
                body = body == null ? anyDocs : Expression.OrElse(body, anyDocs);
            }

            if (body == null)
            {
                return query;
            }

            var lambda = Expression.Lambda<Func<Event, bool>>(body, parameter);
            return query.Where(lambda);
        }
    }
}

