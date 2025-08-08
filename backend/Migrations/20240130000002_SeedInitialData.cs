using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AutomotiveClaimsApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Events
            migrationBuilder.InsertData(
                table: "Events",
                columns: new[] { "ClaimNumber", "EventDate", "Location", "EventDescription", "CauseOfAccident", "WeatherConditions", "RoadConditions", "PoliceReportNumber", "Status", "CreatedBy" },
                values: new object[,]
                {
                    { "CLM-2024-001", new DateTime(2024, 1, 15, 14, 30, 0), "Main St & Oak Ave, Downtown", "Rear-end collision at traffic light", "Following too closely", "Clear", "Dry", "PR-2024-0115", "Open", "System" },
                    { "CLM-2024-002", new DateTime(2024, 1, 20, 9, 45, 0), "Highway 101, Mile Marker 45", "Side-swipe collision during lane change", "Improper lane change", "Rainy", "Wet", "PR-2024-0120", "Under Investigation", "System" },
                    { "CLM-2024-003", new DateTime(2024, 1, 25, 16, 15, 0), "Parking Lot - Shopping Center", "Vehicle backed into parked car", "Failure to yield", "Overcast", "Dry", null, "Closed", "System" },
                    { "CLM-2024-004", new DateTime(2024, 2, 1, 11, 20, 0), "Elm Street & 5th Avenue", "T-bone collision at intersection", "Ran red light", "Clear", "Dry", "PR-2024-0201", "Open", "System" },
                    { "CLM-2024-005", new DateTime(2024, 2, 5, 7, 30, 0), "Interstate 95, Exit 23", "Multi-vehicle pile-up", "Poor visibility", "Foggy", "Wet", "PR-2024-0205", "Under Investigation", "System" }
                });

            // Get Event IDs for foreign key relationships
            var eventIds = new[] { 1, 2, 3, 4, 5 };

            // Seed Participants
            migrationBuilder.InsertData(
                table: "Participants",
                columns: new[] { "EventId", "FirstName", "LastName", "DateOfBirth", "PhoneNumber", "Email", "Address", "City", "State", "ZipCode", "Country", "InsuranceCompany", "PolicyNumber", "VehicleMake", "VehicleModel", "VehicleYear", "VehicleVin", "LicensePlate", "ParticipantType" },
                values: new object[,]
                {
                    { 1, "John", "Smith", new DateTime(1985, 3, 15), "555-0101", "john.smith@email.com", "123 Main St", "Anytown", "CA", "90210", "USA", "State Farm", "SF123456789", "Toyota", "Camry", 2020, "1HGBH41JXMN109186", "ABC123", "Driver" },
                    { 1, "Jane", "Doe", new DateTime(1990, 7, 22), "555-0102", "jane.doe@email.com", "456 Oak Ave", "Anytown", "CA", "90211", "USA", "Allstate", "AS987654321", "Honda", "Civic", 2019, "2HGFC2F59KH123456", "XYZ789", "Driver" },
                    { 2, "Mike", "Johnson", new DateTime(1978, 11, 8), "555-0103", "mike.johnson@email.com", "789 Pine St", "Otherville", "CA", "90212", "USA", "Geico", "GE456789123", "Ford", "F-150", 2021, "1FTFW1ET5MKE12345", "DEF456", "Driver" },
                    { 2, "Sarah", "Wilson", new DateTime(1982, 5, 30), "555-0104", "sarah.wilson@email.com", "321 Elm St", "Otherville", "CA", "90213", "USA", "Progressive", "PG789123456", "Chevrolet", "Malibu", 2018, "1G1ZD5ST8JF123456", "GHI789", "Driver" },
                    { 3, "Robert", "Brown", new DateTime(1975, 9, 12), "555-0105", "robert.brown@email.com", "654 Maple Ave", "Somewhere", "CA", "90214", "USA", "Farmers", "FM123789456", "Nissan", "Altima", 2022, "1N4AL3AP8NC123456", "JKL012", "Driver" }
                });

            // Seed Damages
            migrationBuilder.InsertData(
                table: "Damages",
                columns: new[] { "EventId", "DamageType", "Description", "EstimatedRepairCost", "ActualRepairCost", "RepairShop", "RepairDate", "Severity", "Location" },
                values: new object[,]
                {
                    { 1, "Rear Bumper", "Significant damage to rear bumper and trunk", 2500.00m, 2750.00m, "Joe's Auto Body", new DateTime(2024, 1, 25), "Moderate", "Rear" },
                    { 1, "Taillight", "Left taillight completely shattered", 350.00m, 325.00m, "Joe's Auto Body", new DateTime(2024, 1, 25), "Minor", "Rear Left" },
                    { 2, "Side Panel", "Deep scratches and dents on driver side", 1800.00m, null, null, null, "Moderate", "Driver Side" },
                    { 2, "Side Mirror", "Driver side mirror damaged", 450.00m, null, null, null, "Minor", "Driver Side" },
                    { 3, "Front Bumper", "Minor scratches on front bumper", 800.00m, 750.00m, "Quick Fix Auto", new DateTime(2024, 2, 1), "Minor", "Front" }
                });

            // Seed Client Claims
            migrationBuilder.InsertData(
                table: "ClientClaims",
                columns: new[] { "EventId", "ClaimDate", "ClaimedAmount", "ReserveAmount", "PaidAmount", "SettlementAmount", "Status", "ClaimType", "Description", "AdjusterName", "AdjusterPhone", "AdjusterEmail" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 16), 3000.00m, 3500.00m, 3075.00m, 3075.00m, "Settled", "Property Damage", "Rear-end collision damage claim", "Alice Johnson", "555-0201", "alice.johnson@insurance.com" },
                    { 2, new DateTime(2024, 1, 21), 2500.00m, 3000.00m, null, null, "Under Review", "Property Damage", "Side-swipe damage claim", "Bob Smith", "555-0202", "bob.smith@insurance.com" },
                    { 3, new DateTime(2024, 1, 26), 800.00m, 1000.00m, 750.00m, 750.00m, "Settled", "Property Damage", "Parking lot incident claim", "Carol Davis", "555-0203", "carol.davis@insurance.com" },
                    { 4, new DateTime(2024, 2, 2), 5000.00m, 6000.00m, null, null, "Open", "Property Damage", "Intersection collision claim", "David Wilson", "555-0204", "david.wilson@insurance.com" },
                    { 5, new DateTime(2024, 2, 6), 8000.00m, 10000.00m, null, null, "Under Investigation", "Property Damage", "Multi-vehicle accident claim", "Eva Martinez", "555-0205", "eva.martinez@insurance.com" }
                });

            // Seed Appeals
            migrationBuilder.InsertData(
                table: "Appeals",
                columns: new[] { "EventId", "AppealDate", "AppealReason", "DisputedAmount", "RequestedAmount", "ApprovedAmount", "Status", "ReviewDate", "ReviewNotes", "ReviewedBy" },
                values: new object[,]
                {
                    { 2, new DateTime(2024, 1, 28), "Disagreement with fault determination", 2500.00m, 2500.00m, null, "Under Review", null, null, null },
                    { 4, new DateTime(2024, 2, 8), "Insufficient settlement amount", 5000.00m, 7500.00m, 6000.00m, "Approved", new DateTime(2024, 2, 15), "Partial approval based on additional evidence", "Manager Review Team" }
                });

            // Seed Decisions
            migrationBuilder.InsertData(
                table: "Decisions",
                columns: new[] { "EventId", "DecisionDate", "DecisionType", "ApprovedAmount", "DeductibleAmount", "Status", "Reasoning", "DecisionMaker", "EffectiveDate" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 22), "Claim Approval", 3075.00m, 500.00m, "Approved", "Clear liability, reasonable repair costs", "Senior Adjuster", new DateTime(2024, 1, 23) },
                    { 3, new DateTime(2024, 1, 30), "Claim Approval", 750.00m, 250.00m, "Approved", "Minor damage, straightforward case", "Adjuster", new DateTime(2024, 1, 31) },
                    { 4, new DateTime(2024, 2, 10), "Claim Approval", 6000.00m, 1000.00m, "Approved", "Approved after appeal review", "Senior Manager", new DateTime(2024, 2, 11) }
                });

            // Seed Settlements
            migrationBuilder.InsertData(
                table: "Settlements",
                columns: new[] { "EventId", "SettlementDate", "OriginalClaimAmount", "SettlementAmount", "Status", "SettlementType", "PaymentMethod", "PaymentDate", "PaymentReference", "Description", "ApprovedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 25), 3000.00m, 3075.00m, "Paid", "Full Settlement", "Check", new DateTime(2024, 1, 26), "CHK-2024-001", "Full settlement for rear-end collision", "Alice Johnson" },
                    { 3, new DateTime(2024, 2, 2), 800.00m, 750.00m, "Paid", "Full Settlement", "Direct Deposit", new DateTime(2024, 2, 3), "DD-2024-003", "Settlement for parking lot incident", "Carol Davis" }
                });

            // Seed Documents
            migrationBuilder.InsertData(
                table: "Documents",
                columns: new[] { "EventId", "FileName", "OriginalFileName", "ContentType", "FileSize", "Category", "Description", "ClaimNumber", "UploadedBy", "Tags" },
                values: new object[,]
                {
                    { 1, "police_report_001.pdf", "Police Report CLM-2024-001.pdf", "application/pdf", 1024000, "Police Report", "Official police report for rear-end collision", "CLM-2024-001", "System", "police,report,collision" },
                    { 1, "damage_photos_001.zip", "Damage Photos CLM-2024-001.zip", "application/zip", 5120000, "Photos", "Photos of vehicle damage", "CLM-2024-001", "John Smith", "photos,damage,evidence" },
                    { 2, "estimate_002.pdf", "Repair Estimate CLM-2024-002.pdf", "application/pdf", 512000, "Estimate", "Repair cost estimate", "CLM-2024-002", "Mike Johnson", "estimate,repair,cost" },
                    { 3, "receipt_003.pdf", "Repair Receipt CLM-2024-003.pdf", "application/pdf", 256000, "Receipt", "Final repair receipt", "CLM-2024-003", "Robert Brown", "receipt,repair,payment" }
                });

            // Seed Emails
            migrationBuilder.InsertData(
                table: "Emails",
                columns: new[] { "EventId", "Subject", "Body", "From", "To", "IsRead", "IsSent", "SentAt", "Category", "Priority", "ClaimNumber", "ThreadId" },
                values: new object[,]
                {
                    { 1, "Claim Update - CLM-2024-001", "Your claim has been processed and approved. Settlement check will be mailed within 5 business days.", "claims@insurance.com", "john.smith@email.com", true, true, new DateTime(2024, 1, 23, 10, 30, 0), "Claim Update", "Normal", "CLM-2024-001", "thread-001" },
                    { 2, "Additional Information Required - CLM-2024-002", "We need additional documentation to process your claim. Please provide repair estimates from two certified shops.", "claims@insurance.com", "mike.johnson@email.com", false, true, new DateTime(2024, 1, 25, 14, 15, 0), "Information Request", "High", "CLM-2024-002", "thread-002" },
                    { 3, "Claim Settled - CLM-2024-003", "Your claim has been successfully settled. Payment has been processed via direct deposit.", "claims@insurance.com", "robert.brown@email.com", true, true, new DateTime(2024, 2, 3, 9, 45, 0), "Settlement", "Normal", "CLM-2024-003", "thread-003" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "Appeals", keyColumn: "EventId", keyValues: new object[] { 2, 4 });
            migrationBuilder.DeleteData(table: "ClientClaims", keyColumn: "EventId", keyValues: new object[] { 1, 2, 3, 4, 5 });
            migrationBuilder.DeleteData(table: "Damages", keyColumn: "EventId", keyValues: new object[] { 1, 2, 3 });
            migrationBuilder.DeleteData(table: "Decisions", keyColumn: "EventId", keyValues: new object[] { 1, 3, 4 });
            migrationBuilder.DeleteData(table: "Documents", keyColumn: "EventId", keyValues: new object[] { 1, 2, 3 });
            migrationBuilder.DeleteData(table: "Emails", keyColumn: "EventId", keyValues: new object[] { 1, 2, 3 });
            migrationBuilder.DeleteData(table: "Participants", keyColumn: "EventId", keyValues: new object[] { 1, 2, 3 });
            migrationBuilder.DeleteData(table: "Settlements", keyColumn: "EventId", keyValues: new object[] { 1, 3 });
            migrationBuilder.DeleteData(table: "Events", keyColumn: "ClaimNumber", keyValues: new object[] { "CLM-2024-001", "CLM-2024-002", "CLM-2024-003", "CLM-2024-004", "CLM-2024-005" });
        }
    }
}
