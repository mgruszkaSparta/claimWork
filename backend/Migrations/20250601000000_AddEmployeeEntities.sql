-- SQL migration script: Add employee-related tables
CREATE TABLE "Departments" (
    "Id" serial PRIMARY KEY,
    "Name" varchar(200) NOT NULL
);

CREATE TABLE "EmployeeRoles" (
    "Id" serial PRIMARY KEY,
    "Name" varchar(100) NOT NULL
);

CREATE TABLE "Employees" (
    "Id" serial PRIMARY KEY,
    "FirstName" varchar(100) NOT NULL,
    "LastName" varchar(100) NOT NULL,
    "Email" varchar(200),
    "DepartmentId" int REFERENCES "Departments"("Id"),
    "RoleId" int REFERENCES "EmployeeRoles"("Id")
);

CREATE INDEX "IX_Employees_DepartmentId" ON "Employees" ("DepartmentId");
CREATE INDEX "IX_Employees_RoleId" ON "Employees" ("RoleId");

-- Down migration
-- DROP TABLE IF EXISTS "Employees";
-- DROP TABLE IF EXISTS "Departments";
-- DROP TABLE IF EXISTS "EmployeeRoles";
