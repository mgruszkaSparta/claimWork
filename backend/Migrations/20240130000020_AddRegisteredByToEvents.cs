using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddRegisteredByToEvents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegisteredById",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_RegisteredById",
                table: "Events",
                column: "RegisteredById");

            migrationBuilder.AddForeignKey(
                name: "FK_Events_AspNetUsers_RegisteredById",
                table: "Events",
                column: "RegisteredById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Events_AspNetUsers_RegisteredById",
                table: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Events_RegisteredById",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RegisteredById",
                table: "Events");
        }
    }
}
