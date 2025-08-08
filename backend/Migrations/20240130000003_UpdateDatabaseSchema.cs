using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update Events table
            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedTotalDamage",
                table: "Events",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            // Update Damages table - add missing columns
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Damages",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "Damages",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValue: "Minor");

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedCost",
                table: "Damages",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ActualCost",
                table: "Damages",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Damages",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RepairDate",
                table: "Damages",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Damages",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            // Update Documents table - add missing columns
            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "Documents",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DamageId",
                table: "Documents",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // Create foreign key for DamageId
            migrationBuilder.CreateIndex(
                name: "IX_Documents_DamageId",
                table: "Documents",
                column: "DamageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Damages_DamageId",
                table: "Documents",
                column: "DamageId",
                principalTable: "Damages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Damages_DamageId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_DamageId",
                table: "Documents");

            // Remove added columns from Documents
            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "DamageId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Documents");

            // Remove added columns from Damages
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "Severity",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "EstimatedCost",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "ActualCost",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "RepairDate",
                table: "Damages");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Damages");
        }
    }
}
