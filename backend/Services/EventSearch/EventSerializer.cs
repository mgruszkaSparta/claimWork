using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace AutomotiveClaimsApi.Services.EventSearch
{
    public static class EventSerializer
    {
        public static string Serialize(object value)
        {
            var options = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.IgnoreCycles,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            JsonNode? node = JsonSerializer.SerializeToNode(value, options);
            RemoveKeys(node);
            return node?.ToJsonString(options) ?? "{}";
        }

        private static void RemoveKeys(JsonNode? node)
        {
            if (node is JsonObject obj)
            {
                var keysToRemove = obj
                    .Where(kvp => IsKeyToIgnore(kvp.Key))
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var key in keysToRemove)
                {
                    obj.Remove(key);
                }

                foreach (var kvp in obj.ToList())
                {
                    RemoveKeys(kvp.Value);
                }
            }
            else if (node is JsonArray arr)
            {
                foreach (var item in arr)
                {
                    RemoveKeys(item);
                }
            }
        }

        private static bool IsKeyToIgnore(string key)
            => key.Equals("Id", StringComparison.OrdinalIgnoreCase) || key.EndsWith("Id", StringComparison.OrdinalIgnoreCase);
    }
}

