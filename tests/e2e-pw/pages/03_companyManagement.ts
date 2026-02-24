import { Page, expect } from "@playwright/test";
import { ErpLocators } from "../locator/erp_locator";

export type CompanyData = {
    name: string;
    email?: string;
    phone?: string;
    status?: "true" | "false";
};

export class CompanyManagementPage {
    /**
     * Page and shared locators
     */
    readonly page: Page;
    readonly erpLocators: ErpLocators;
    companyCount: number = 0;

    constructor(page: Page) {
        this.page = page;
        this.erpLocators = new ErpLocators(page);
    }

    /**
     * Navigate to companies listing and read initial count
     */
    async gotoCompaniesPage() {
        await this.page.goto("/admin/companies");
        await expect(this.page).toHaveURL(/.*companies/);
        await expect(this.erpLocators.companiesTable.first()).toBeVisible();
        
        // Read count from UI
        const countText = await this.erpLocators.allCompaniesCount.textContent();
        console.log("Initial Count:", countText);
        this.companyCount = countText ? parseInt(countText.trim()) : 0;
        // console.log("Current Count:", this.companyCount);
    }

    /**
     * Open create company form
     */
    async openCreateCompanyForm() {
        await this.erpLocators.companiesCreateButton.click();
        await expect(this.page).toHaveURL(/.*(create|companies)/);
    }

    /**
     * Create company using provided data
     */
    async createCompany(companyData: CompanyData) {
        await this.openCreateCompanyForm();

        await this.erpLocators.companiesNameInput.fill(companyData.name);
        if (companyData.email) await this.erpLocators.companiesEmailInput.fill(companyData.email);
        if (companyData.phone) await this.erpLocators.companiesPhoneInput.fill(companyData.phone);
        if (companyData.status && companyData.status.toLowerCase() !== "true") {
            const toggle = this.erpLocators.companiesStatusToggleOn;
            await toggle.click();
        }

        await this.erpLocators.companiesSaveButton.click();
        await this.expectSuccessFeedback();
        
        // Increase count by 1 after successful creation
        this.companyCount += 1;
        // console.log("Count after creation:", this.companyCount);
    }

    /**
     * Submit empty form and validate required messages
     */
    async createCompanyWithEmptyRequiredFields() {
        await this.openCreateCompanyForm();
        await this.erpLocators.companiesSaveButton.click();
        await expect(this.erpLocators.companiesValidationMessage.first()).toBeVisible();
    }

    /**
     * Attempt duplicate record creation
     */
    async createCompanyWithDuplicateData(companyData: CompanyData) {
        await this.createCompany(companyData);
        await this.gotoCompaniesPage();
        await this.createCompany(companyData);
        await expect(this.erpLocators.companiesErrorToast).toBeVisible();
    }

    /**
     * Search company using listing search input
     */
    async searchCompany(keyword: string) {
        const searchInput = this.erpLocators.companiesSearchInput;
        await searchInput.fill(keyword);
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Assert company row is visible in list
     */
    async assertCompanyVisible(identifier: string) {
        await this.searchCompany(identifier);
        await expect(this.page.getByText(identifier).first()).toBeVisible();
    }

    /**
     * Edit company name by opening first matched row action
     */
    async editCompany(searchKey: string, updates: Partial<CompanyData>) {
        await this.searchCompany(searchKey);
        await this.erpLocators.companiesRowActionsButton.first().click();
        await this.erpLocators.companiesEditButton.first().click();

        if (updates.name) await this.erpLocators.companiesNameInput.fill(updates.name);
        if (updates.email) await this.erpLocators.companiesEmailInput.fill(updates.email);
        if (updates.phone) await this.erpLocators.companiesPhoneInput.fill(updates.phone);
        if (updates.code) await this.erpLocators.companiesCodeInput.fill(updates.code);
        if (updates.address) await this.erpLocators.companiesAddressInput.fill(updates.address);

        await this.erpLocators.companiesSaveButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Toggle company status from row action or inline switch
     */
    async toggleCompanyStatus(searchKey: string) {
        await this.searchCompany(searchKey);
        await this.erpLocators.companiesStatusToggle.first().click();
        await this.expectSuccessFeedback();
    }

    /**
     * Delete company from list
     */
    async deleteCompany(searchKey: string) {
        await this.searchCompany(searchKey);
        await this.erpLocators.companiesRowActionsButton.first().click();
        await this.erpLocators.companiesDeleteButton.first().click();
        await this.erpLocators.companiesConfirmDeleteButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Reusable assertion for success toast/notification
     */
    private async expectSuccessFeedback() {
        await this.page.waitForLoadState("networkidle");
        await expect(this.erpLocators.companiesSuccessToast).toBeVisible();
    }
}
