import { test , expect } from "../setup";
import { CompanyManagementPage, type CompanyData } from "../pages/03_companyManagement";

test.describe("Companies Module E2E", () => {
    test.beforeEach(async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        await companyPage.gotoCompaniesPage();
    });

    test("Access Companies Listing - Loads Table", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        await companyPage.gotoCompaniesPage();
    });

    test("Create Company - Valid Inputs", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const initialCount = companyPage.companyCount;
        // console.log("Initial Company Count:", initialCount);
        const key = Date.now();
        const companyData: CompanyData = {
            name: `E2E Company ${key}`,
            email: `company+${key}@example.com`,
            phone: "9999999999",
            status: "true",
        };

        await companyPage.createCompany(companyData);
        expect(companyPage.companyCount).toBe(initialCount + 1);
        console.log("Company Count after creation:", companyPage.companyCount);
    });

    test("Create Company - Inactive Status", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const key = Date.now();
        const companyData: CompanyData = {
            name: `E2E Company ${key}`,
            email: `company+${key}@example.com`,
            phone: "9999999999",
            status: "false",
        };

        await companyPage.createCompany(companyData);
        await companyPage.gotoCompaniesPage();
        await companyPage.assertCompanyVisible(companyData.name);
    });

    test("Create Company - Required Field Validation", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        await companyPage.createCompanyWithEmptyRequiredFields();
    });

    test("Create Company - Duplicate Validation", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const key = Date.now();
        const companyData: CompanyData = {
            name: `E2E Duplicate Company ${key}`,
            email: `company-dup+${key}@example.com`,
        };

        await companyPage.createCompanyWithDuplicateData(companyData);
    });

    test("Edit Company - Updates Name In Listing", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const key = Date.now();
        const originalName = `E2E Edit Company ${key}`;
        const updatedName = `E2E Edited Company ${key}`;

        await companyPage.createCompany({ name: originalName, email: `edit+${key}@example.com` });
        await companyPage.gotoCompaniesPage();
        await companyPage.editCompany(originalName, { name: updatedName });
        await companyPage.gotoCompaniesPage();
        await companyPage.assertCompanyVisible(updatedName);
    });

    test("Toggle Company Status - Updates Successfully", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const key = Date.now();
        const name = `E2E Toggle Company ${key}`;

        await companyPage.createCompany({ name, email: `toggle+${key}@example.com` });
        await companyPage.gotoCompaniesPage();
        await companyPage.toggleCompanyStatus(name);
    });

    test("Delete Company - Removes Record", async ({ adminPage }) => {
        const companyPage = new CompanyManagementPage(adminPage);
        const key = Date.now();
        const name = `E2E Delete Company ${key}`;

        await companyPage.createCompany({ name, email: `delete+${key}@example.com` });
        await companyPage.gotoCompaniesPage();
        await companyPage.deleteCompany(name);
    });
});
