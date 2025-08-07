using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseHandlerVacations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dict");

            migrationBuilder.CreateTable(
                name: "CaseHandlerVacations",
                schema: "dict",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CaseHandlerId = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubstituteHandlerId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseHandlerVacations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaseHandlerVacations_CaseHandlers_CaseHandlerId",
                        column: x => x.CaseHandlerId,
                        principalSchema: "dict",
                        principalTable: "CaseHandlers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CaseHandlerVacations_CaseHandlers_SubstituteHandlerId",
                        column: x => x.SubstituteHandlerId,
                        principalSchema: "dict",
                        principalTable: "CaseHandlers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CaseHandlerVacations_CaseHandlerId",
                schema: "dict",
                table: "CaseHandlerVacations",
                column: "CaseHandlerId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseHandlerVacations_SubstituteHandlerId",
                schema: "dict",
                table: "CaseHandlerVacations",
                column: "SubstituteHandlerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CaseHandlerVacations",
                schema: "dict");
        }
    }
}
