using Microsoft.EntityFrameworkCore.Migrations;

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddClientClaimDocumentFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocumentPath",
                table: "ClientClaims",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentName",
                table: "ClientClaims",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentDescription",
                table: "ClientClaims",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentPath",
                table: "ClientClaims");

            migrationBuilder.DropColumn(
                name: "DocumentName",
                table: "ClientClaims");

            migrationBuilder.DropColumn(
                name: "DocumentDescription",
                table: "ClientClaims");
        }
    }
}
