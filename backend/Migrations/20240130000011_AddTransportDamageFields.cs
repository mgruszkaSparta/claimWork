using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportDamageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CargoDescription",
                table: "Events",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Carrier",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarrierPolicyNumber",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionContactEmail",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionContactName",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionContactPhone",
                table: "Events",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Losses",
                table: "Events",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CargoDescription",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Carrier",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "CarrierPolicyNumber",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InspectionContactEmail",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InspectionContactName",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InspectionContactPhone",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Losses",
                table: "Events");
        }
    }
}
