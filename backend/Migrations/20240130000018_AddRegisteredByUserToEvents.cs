using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddRegisteredByUserToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegisteredByUserId",
                table: "Events",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_RegisteredByUserId",
                table: "Events",
                column: "RegisteredByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_RegisteredByUserId",
                table: "Events",
                column: "RegisteredByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_RegisteredByUserId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_RegisteredByUserId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RegisteredByUserId",
                table: "Events");
        }
    }
}
