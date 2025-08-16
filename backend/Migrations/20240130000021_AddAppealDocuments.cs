using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddAppealDocuments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocumentPath",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "DocumentName",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "DocumentDescription",
                table: "Appeals");

            migrationBuilder.CreateTable(
                name: "AppealDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    AppealId = table.Column<Guid>(type: "uuid", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppealDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppealDocuments_Appeals_AppealId",
                        column: x => x.AppealId,
                        principalTable: "Appeals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppealDocuments_AppealId",
                table: "AppealDocuments",
                column: "AppealId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppealDocuments");

            migrationBuilder.AddColumn<string>(
                name: "DocumentPath",
                table: "Appeals",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentName",
                table: "Appeals",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DocumentDescription",
                table: "Appeals",
                type: "text",
                nullable: true);
        }
    }
}
