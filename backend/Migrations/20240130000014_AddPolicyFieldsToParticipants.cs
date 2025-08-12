using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddPolicyFieldsToParticipants : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime?>
            (
                name: "PolicyDealDate",
                table: "Participants",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTime?>
            (
                name: "PolicyStartDate",
                table: "Participants",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTime?>
            (
                name: "PolicyEndDate",
                table: "Participants",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<decimal?>
            (
                name: "PolicySumAmount",
                table: "Participants",
                type: "decimal(18,2)",
                nullable: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PolicyDealDate",
                table: "Participants"
            );

            migrationBuilder.DropColumn(
                name: "PolicyStartDate",
                table: "Participants"
            );

            migrationBuilder.DropColumn(
                name: "PolicyEndDate",
                table: "Participants"
            );

            migrationBuilder.DropColumn(
                name: "PolicySumAmount",
                table: "Participants"
            );
        }
    }
}
