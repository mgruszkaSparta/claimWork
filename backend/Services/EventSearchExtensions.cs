using AutomotiveClaimsApi.Models;

namespace AutomotiveClaimsApi.Services
{
    public static class EventSearchExtensions
    {
        public static IQueryable<Event> ApplySearch(this IQueryable<Event> query, string? search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return query;
            }

            var lower = search.ToLower();
            return query.Where(e => e.SearchData != null && e.SearchData.ToLower().Contains(lower));
        }
    }
}

