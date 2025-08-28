import { apiService, API_BASE_URL, type UserListItemDto } from "../api";
import type { Role, User, UserFilters, Permission } from "../types/admin";

// Predefined role colors for display
const ROLE_COLORS: Record<string, string> = {
  admin: "#e11d48", // rose-600
  user: "#2563eb",  // blue-600
  likwidator: "#16a34a", // green-600
};

export const adminService = {
  async getRoles(): Promise<Role[]> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await fetch(`${API_BASE_URL}/roles`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Handle cases where the response has no body or invalid JSON
    const text = await res.text();
    let data: { value: string; label: string }[] = [];

    if (text) {
      try {
        data = JSON.parse(text) as { value: string; label: string }[];
      } catch {
        data = [];
      }
    }

    return data.map((r) => ({
      id: r.value,
      name: r.label,
      color: ROLE_COLORS[r.value] ?? "#6b7280",
      permissions: [],
    }));
  },

  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    const { items } = await apiService.getUsers({
      search: filters.search,
      role: filters.roleId,
      status: filters.status,
      sortBy:
        filters.sortBy === "name"
          ? "lastName"
          : filters.sortBy === "email"
            ? "email"
            : filters.sortBy === "createdAt"
              ? "createdAt"
              : filters.sortBy === "lastLogin"
                ? "lastLogin"
                : undefined,
      sortOrder: filters.sortOrder,
    });

    return items.map(mapUserDto);
  },

  async getUser(id: string): Promise<User> {
    const dto = await apiService.getUser(id);
    return {
      id: dto.id,
      firstName: dto.firstName ?? "",
      lastName: dto.lastName ?? "",
      email: dto.email ?? "",
      roles: (dto.roles ?? []).map((r) => ({ id: r, name: r, color: ROLE_COLORS[r] ?? "#6b7280" })),
      status: (dto.status ?? "active") as User["status"],
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      lastLogin: dto.lastLogin ? new Date(dto.lastLogin) : null,
      avatar: undefined,
      fullAccess: dto.fullAccess ?? false,
      clientIds: dto.clientIds ?? [],
    };
  },

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    await apiService.updateUser(id, {
      userName: undefined,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles?.map((r) => r.id),
      status: data.status,
      phone: undefined,
      fullAccess: data.fullAccess,
      clientIds: data.clientIds,
    });
  },

  async createUser(data: User & { password: string }): Promise<void> {
    await apiService.createUser({
      userName: data.email,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles.map((r) => r.id),
      status: data.status,
      fullAccess: data.fullAccess,
      clientIds: data.clientIds,
    })
  },

  async deleteUser(id: string): Promise<void> {
    await apiService.updateUsersBulk({ action: "delete", userIds: [id] });
  },

  getPermissionsByCategory(): Record<string, Permission[]> {
    return {
      System: [
        {
          id: "manage_users",
          name: "Zarządzanie użytkownikami",
          description: "Dodawanie i edycja użytkowników",
          resource: "users",
          action: "manage",
        },
      ],
    };
  },
};

function mapUserDto(dto: UserListItemDto): User {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    roles: [
      {
        id: dto.role,
        name: dto.role,
        color: ROLE_COLORS[dto.role] ?? "#6b7280",
      },
    ],
    status: dto.status as User["status"],
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    lastLogin: dto.lastLogin ? new Date(dto.lastLogin) : null,
    avatar: undefined,
    fullAccess: dto.fullAccess,
    clientIds: dto.clientIds,
  };
}
