using System.Collections.Generic;
using System.Linq;

namespace AutomotiveClaimsApi.Authorization
{
    public static class Roles
    {
        public const string Owner = "Owner";
        public const string Admin = "Admin";
        public const string Manager = "Manager";
        public const string Viewer = "Viewer";

        public static readonly string[] All = { Owner, Admin, Manager, Viewer };
    }

    public static class Permissions
    {
        public const string UsersRead = "users.read";
        public const string UsersCreate = "users.create";
        public const string UsersUpdate = "users.update";
        public const string UsersDelete = "users.delete";
        public const string UsersInvite = "users.invite";
        public const string UsersAssignRoles = "users.assignRoles";

        public static readonly string[] All =
        {
            UsersRead, UsersCreate, UsersUpdate, UsersDelete, UsersInvite, UsersAssignRoles
        };
    }

    public static class RolePermissions
    {
        public static readonly Dictionary<string, string[]> Mapping = new()
        {
            { Roles.Owner, new [] { Permissions.UsersRead, Permissions.UsersCreate, Permissions.UsersUpdate, Permissions.UsersDelete, Permissions.UsersInvite, Permissions.UsersAssignRoles } },
            { Roles.Admin, new [] { Permissions.UsersRead, Permissions.UsersCreate, Permissions.UsersUpdate, Permissions.UsersDelete, Permissions.UsersInvite, Permissions.UsersAssignRoles } },
            { Roles.Manager, new [] { Permissions.UsersRead, Permissions.UsersCreate, Permissions.UsersUpdate, Permissions.UsersInvite } },
            { Roles.Viewer, new [] { Permissions.UsersRead } },
        };

        public static Dictionary<string, string[]> Invert()
        {
            var dict = new Dictionary<string, List<string>>();
            foreach (var (role, perms) in Mapping)
            {
                foreach (var perm in perms)
                {
                    if (!dict.TryGetValue(perm, out var list))
                    {
                        list = new List<string>();
                        dict[perm] = list;
                    }
                    list.Add(role);
                }
            }
            return dict.ToDictionary(k => k.Key, v => v.Value.ToArray());
        }
    }
}
