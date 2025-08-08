using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesFieldsToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocumentsNotes",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GeneralNotes",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNotes",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvestigationNotes",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairNotes",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SettlementNotes",
                table: "Events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentsNotes",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "GeneralNotes",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InternalNotes",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InvestigationNotes",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RepairNotes",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SettlementNotes",
                table: "Events");
        }
    }
}
