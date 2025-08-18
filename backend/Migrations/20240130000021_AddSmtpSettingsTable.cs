using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    public partial class AddSmtpSettingsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SmtpSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Host = table.Column<string>(type: "nvarchar(255)", nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    EnableSsl = table.Column<bool>(type: "bit", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Password = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    FromEmail = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    FromName = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    Timeout = table.Column<int>(type: "int", nullable: false),
                    UseDefaultCredentials = table.Column<bool>(type: "bit", nullable: false),
                    ImapServer = table.Column<string>(type: "nvarchar(255)", nullable: true),
                    ImapPort = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SmtpSettings", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SmtpSettings");
        }
    }
}
