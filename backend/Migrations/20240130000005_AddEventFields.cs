using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddEventFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InsurerClaimNumber",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleNumber",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Owner",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InsuranceCompanyPhone",
                table: "Events",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InsuranceCompanyEmail",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PolicyNumber",
                table: "Events",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReportDateToInsurer",
                table: "Events",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Liquidator",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeasingCompanyPhone",
                table: "Events",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeasingCompanyEmail",
                table: "Events",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventTime",
                table: "Events",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Events",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WereInjured",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StatementWithPerpetrator",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PerpetratorFined",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Update Email table
            migrationBuilder.AddColumn<string>(
                name: "BodyHtml",
                table: "Emails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHtml",
                table: "Emails",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Emails",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                table: "Emails",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Outbound");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Emails",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Emails",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClaimId",
                table: "Emails",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "References",
                table: "Emails",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReadAt",
                table: "Emails",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "Emails",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "Emails",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "InsurerClaimNumber", table: "Events");
            migrationBuilder.DropColumn(name: "VehicleNumber", table: "Events");
            migrationBuilder.DropColumn(name: "Brand", table: "Events");
            migrationBuilder.DropColumn(name: "Model", table: "Events");
            migrationBuilder.DropColumn(name: "Owner", table: "Events");
            migrationBuilder.DropColumn(name: "InsuranceCompanyPhone", table: "Events");
            migrationBuilder.DropColumn(name: "InsuranceCompanyEmail", table: "Events");
            migrationBuilder.DropColumn(name: "PolicyNumber", table: "Events");
            migrationBuilder.DropColumn(name: "ReportDateToInsurer", table: "Events");
            migrationBuilder.DropColumn(name: "Liquidator", table: "Events");
            migrationBuilder.DropColumn(name: "LeasingCompanyPhone", table: "Events");
            migrationBuilder.DropColumn(name: "LeasingCompanyEmail", table: "Events");
            migrationBuilder.DropColumn(name: "EventTime", table: "Events");
            migrationBuilder.DropColumn(name: "Area", table: "Events");
            migrationBuilder.DropColumn(name: "WereInjured", table: "Events");
            migrationBuilder.DropColumn(name: "StatementWithPerpetrator", table: "Events");
            migrationBuilder.DropColumn(name: "PerpetratorFined", table: "Events");

            migrationBuilder.DropColumn(name: "BodyHtml", table: "Emails");
            migrationBuilder.DropColumn(name: "IsHtml", table: "Emails");
            migrationBuilder.DropColumn(name: "IsArchived", table: "Emails");
            migrationBuilder.DropColumn(name: "Direction", table: "Emails");
            migrationBuilder.DropColumn(name: "Status", table: "Emails");
            migrationBuilder.DropColumn(name: "Tags", table: "Emails");
            migrationBuilder.DropColumn(name: "ClaimId", table: "Emails");
            migrationBuilder.DropColumn(name: "References", table: "Emails");
            migrationBuilder.DropColumn(name: "ReadAt", table: "Emails");
            migrationBuilder.DropColumn(name: "ErrorMessage", table: "Emails");
            migrationBuilder.DropColumn(name: "RetryCount", table: "Emails");
        }
    }
}
