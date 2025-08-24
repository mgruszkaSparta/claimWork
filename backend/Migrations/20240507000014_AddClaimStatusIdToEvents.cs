using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddClaimStatusIdToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClaimStatusId",
                table: "Events",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_ClaimStatusId",
                table: "Events",
                column: "ClaimStatusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_ClaimStatuses_ClaimStatusId",
                table: "Events",
                column: "ClaimStatusId",
                principalTable: "ClaimStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_ClaimStatuses_ClaimStatusId",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_ClaimStatusId",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ClaimStatusId",
                table: "Events");
        }
    }
}
