using System;
using Microsoft.EntityFrameworkCore.Migrations;
using AutomotiveClaimsApi.Services;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAutomationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaskTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EventRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    TaskTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NotificationTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventRules_NotificationTemplates_NotificationTemplateId",
                        column: x => x.NotificationTemplateId,
                        principalTable: "NotificationTemplates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EventRules_TaskTemplates_TaskTemplateId",
                        column: x => x.TaskTemplateId,
                        principalTable: "TaskTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TaskHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DecisionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RecourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SettlementId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AppealId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TaskTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskHistories_Appeals_AppealId",
                        column: x => x.AppealId,
                        principalTable: "Appeals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskHistories_Decisions_DecisionId",
                        column: x => x.DecisionId,
                        principalTable: "Decisions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskHistories_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskHistories_Recourses_RecourseId",
                        column: x => x.RecourseId,
                        principalTable: "Recourses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskHistories_Settlements_SettlementId",
                        column: x => x.SettlementId,
                        principalTable: "Settlements",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskHistories_TaskTemplates_TaskTemplateId",
                        column: x => x.TaskTemplateId,
                        principalTable: "TaskTemplates",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "NotificationHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DecisionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RecourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SettlementId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AppealId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NotificationTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationHistories_Appeals_AppealId",
                        column: x => x.AppealId,
                        principalTable: "Appeals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationHistories_Decisions_DecisionId",
                        column: x => x.DecisionId,
                        principalTable: "Decisions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationHistories_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotificationHistories_NotificationTemplates_NotificationTemplateId",
                        column: x => x.NotificationTemplateId,
                        principalTable: "NotificationTemplates",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationHistories_Recourses_RecourseId",
                        column: x => x.RecourseId,
                        principalTable: "Recourses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationHistories_Settlements_SettlementId",
                        column: x => x.SettlementId,
                        principalTable: "Settlements",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventRules_NotificationTemplateId",
                table: "EventRules",
                column: "NotificationTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRules_TaskTemplateId",
                table: "EventRules",
                column: "TaskTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_AppealId",
                table: "NotificationHistories",
                column: "AppealId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_DecisionId",
                table: "NotificationHistories",
                column: "DecisionId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_EventId",
                table: "NotificationHistories",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_NotificationTemplateId",
                table: "NotificationHistories",
                column: "NotificationTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_RecourseId",
                table: "NotificationHistories",
                column: "RecourseId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationHistories_SettlementId",
                table: "NotificationHistories",
                column: "SettlementId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_AppealId",
                table: "TaskHistories",
                column: "AppealId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_DecisionId",
                table: "TaskHistories",
                column: "DecisionId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_EventId",
                table: "TaskHistories",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_RecourseId",
                table: "TaskHistories",
                column: "RecourseId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_SettlementId",
                table: "TaskHistories",
                column: "SettlementId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_TaskTemplateId",
                table: "TaskHistories",
                column: "TaskTemplateId");

            migrationBuilder.InsertData(
                table: "EventRules",
                columns: new[] { "Id", "EventType" },
                values: new object[] { Guid.NewGuid(), (int)ClaimNotificationEvent.DecisionAdded });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationHistories");

            migrationBuilder.DropTable(
                name: "TaskHistories");

            migrationBuilder.DropTable(
                name: "EventRules");

            migrationBuilder.DropTable(
                name: "NotificationTemplates");

            migrationBuilder.DropTable(
                name: "TaskTemplates");
        }
    }
}

