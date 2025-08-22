using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseHandlerIdToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaseHandlerId",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_CaseHandlerId",
                table: "AspNetUsers",
                column: "CaseHandlerId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_CaseHandlers_CaseHandlerId",
                table: "AspNetUsers",
                column: "CaseHandlerId",
                principalSchema: "dict",
                principalTable: "CaseHandlers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_CaseHandlers_CaseHandlerId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_CaseHandlerId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CaseHandlerId",
                table: "AspNetUsers");
        }
    }
}
