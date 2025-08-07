using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddClientFieldsAndNewClient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new columns to Clients table
            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Clients",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Clients",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Clients",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            // Insert the new client
            migrationBuilder.InsertData(
                table: "Clients",
                columns: new[] { "Name", "FullName", "ShortName", "PhoneNumber", "Email", "Address", "IsActive", "CreatedAt" },
                values: new object[] { 
                    "JUST IN TIME SERVICE", 
                    "AGNIESZKA KĘDZIORA-URBANOWICZ JUST IN TIME SERVICE", 
                    "JIT SERVICE", 
                    "+48 17 234 56 78", 
                    "agnieszka@justintime.pl", 
                    "ul. Terminowa 3", 
                    true, 
                    DateTime.UtcNow 
                });

            // Create indexes for better performance
            migrationBuilder.CreateIndex(
                name: "IX_Clients_Email",
                table: "Clients",
                column: "Email",
                filter: "Email IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Clients",
                column: "PhoneNumber",
                filter: "PhoneNumber IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes
            migrationBuilder.DropIndex(
                name: "IX_Clients_Email",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_PhoneNumber",
                table: "Clients");

            // Remove the inserted client (optional - you might want to keep the data)
            migrationBuilder.DeleteData(
                table: "Clients",
                keyColumn: "Email",
                keyValue: "agnieszka@justintime.pl");

            // Drop columns
            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Clients");
        }
    }
}
