using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddSubcontractorFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubcontractorName",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubcontractorPolicyNumber",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubcontractorInsurer",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ComplaintToSubcontractor",
                table: "Events",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ComplaintToSubcontractorDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ClaimFromSubcontractorPolicy",
                table: "Events",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClaimFromSubcontractorPolicyDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ComplaintResponse",
                table: "Events",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ComplaintResponseDate",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubcontractorName",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SubcontractorPolicyNumber",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SubcontractorInsurer",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ComplaintToSubcontractor",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ComplaintToSubcontractorDate",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ClaimFromSubcontractorPolicy",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ClaimFromSubcontractorPolicyDate",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ComplaintResponse",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ComplaintResponseDate",
                table: "Events");
        }
    }
}
