using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class SeedRoles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "Name", "NormalizedName", "ConcurrencyStamp" },
                values: new object[,]
                {
                    { "ddd1edb6-8711-43ce-9677-3dab77e1a85a", "Owner", "OWNER", "afab92d9-288d-4cec-97c0-8edf4c771135" },
                    { "2ff3913b-3101-47e5-a0a3-fc9c8545f093", "Admin", "ADMIN", "47a99e59-945e-41e3-b884-565625e346ad" },
                    { "ef667f01-f588-4611-883d-50f1b07c38da", "Manager", "MANAGER", "4e574346-8129-4c94-b786-5a223d6b6dd0" },
                    { "db6a9ab0-25de-4bc1-88ce-e0c1443ffeea", "Viewer", "VIEWER", "50014f5b-e953-4f99-953d-552e32f6ddea" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    "ddd1edb6-8711-43ce-9677-3dab77e1a85a",
                    "2ff3913b-3101-47e5-a0a3-fc9c8545f093",
                    "ef667f01-f588-4611-883d-50f1b07c38da",
                    "db6a9ab0-25de-4bc1-88ce-e0c1443ffeea"
                });
        }
    }
}
