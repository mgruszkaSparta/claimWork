using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddNewFieldsToDamages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RiskType",
                table: "Damages",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "177");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Damages",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "2");

            migrationBuilder.AddColumn<string>(
                name: "DamageDescription",
                table: "Damages",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedRepairCost",
                table: "Damages",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ActualRepairCost",
                table: "Damages",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairLocation",
                table: "Damages",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Damages_RiskType",
                table: "Damages",
                column: "RiskType");

            migrationBuilder.CreateIndex(
                name: "IX_Damages_Status",
                table: "Damages",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Damages_DamageDate",
                table: "Damages",
                column: "DamageDate");

            migrationBuilder.CreateIndex(
                name: "IX_Damages_CreatedAt",
                table: "Damages",
                column: "CreatedAt");

            // Add check constraints
            migrationBuilder.Sql(@"
                ALTER TABLE Damages 
                ADD CONSTRAINT CK_Damages_RiskType 
                CHECK (RiskType IN ('null', '14', '134', '244', '254', '263', '177', '1857', '2957', '21057', '21157', '21257', '21919', '1204', '1224', '1234', '1'))
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE Damages 
                ADD CONSTRAINT CK_Damages_Status 
                CHECK (Status IN ('1', '2', '3', '5', '6', '8', '9', '10'))
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Damages_RiskType",
                table: "Damages");

            migrationBuilder.DropIndex(
                name: "IX_Damages_Status",
                table: "Damages");

            migrationBuilder.DropIndex(
                name: "IX_Damages_DamageDate",
                table: "Damages");

            migrationBuilder.DropIndex(
                name: "IX_Damages_CreatedAt",
                table: "Damages");

            // Drop check constraints
            migrationBuilder.Sql("ALTER TABLE Damages DROP CONSTRAINT CK_Damages_RiskType");
            migrationBuilder.Sql("ALTER TABLE Damages DROP CONSTRAINT CK_Damages_Status");

            migrationBuilder.DropColumn(
                name: "RiskType",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "DamageDescription",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "EstimatedRepairCost",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "ActualRepairCost",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "RepairLocation",
                table: "Damages");
        }
    }
}
