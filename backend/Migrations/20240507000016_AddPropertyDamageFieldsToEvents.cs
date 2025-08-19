using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyDamageFieldsToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PropertyDamageSubject",
                table: "Events",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DamageListing",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InspectionContact",
                table: "Events",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PoliceDescription",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AmbulanceDescription",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FireDescription",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TowDescription",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InjuredData",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PerpetratorData",
                table: "Events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PropertyDamageSubject",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "DamageListing",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InspectionContact",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "PoliceDescription",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "AmbulanceDescription",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "FireDescription",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "TowDescription",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "InjuredData",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "PerpetratorData",
                table: "Events");
        }
    }
}
