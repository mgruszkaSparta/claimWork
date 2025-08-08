using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddDecisionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DecisionAmount",
                table: "Decisions",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "DecisionStatus",
                table: "Decisions",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "DecisionDescription",
                table: "Decisions",
                newName: "DocumentDescription");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Decisions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompensationTitle",
                table: "Decisions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentName",
                table: "Decisions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentPath",
                table: "Decisions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Decisions");

            migrationBuilder.DropColumn(
                name: "CompensationTitle",
                table: "Decisions");

            migrationBuilder.DropColumn(
                name: "DocumentName",
                table: "Decisions");

            migrationBuilder.DropColumn(
                name: "DocumentPath",
                table: "Decisions");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Decisions",
                newName: "DecisionAmount");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Decisions",
                newName: "DecisionStatus");

            migrationBuilder.RenameColumn(
                name: "DocumentDescription",
                table: "Decisions",
                newName: "DecisionDescription");
        }
    }
}
