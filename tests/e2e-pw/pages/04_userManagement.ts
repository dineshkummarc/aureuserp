import { Page, expect } from "@playwright/test";
import { ErpLocators } from "../locator/erp_locator";
import { ADMIN_AUTH_STATE_PATH } from "../playwright.config";

export type UserData = {
    name: string;
    email: string;
    password: string;
    role: string;
    company: string;
    Status?: "Active" | "Inactive";
};

export class UserManagementPage {
    /**
     * Page and shared locators
     */
    readonly page: Page;
    readonly erpLocators: ErpLocators;

    constructor(page: Page) {
        this.page = page;
        this.erpLocators = new ErpLocators(page);
    }

    /**
     * Navigate to users listing
     */
    async gotoUsersPage() {
        await this.page.goto("/admin/users");
        await expect(this.page).toHaveURL(/.*users/);
        await expect(this.erpLocators.usersTable.first()).toBeVisible();
    }

    /**
     * Open create user form
     */
    async openCreateUserForm() {
        await this.erpLocators.usersCreateButton.click();
        await expect(this.page).toHaveURL(/.*(users|create)/);
    }

    /**
     * Create user with all required fields
     */
    async createUser(userData: UserData) {
        await this.openCreateUserForm();

        await this.erpLocators.usersNameInput.fill(userData.name);
        await this.erpLocators.usersEmailInput.fill(userData.email);
        await this.erpLocators.usersPasswordInput.fill(userData.password);
        await this.erpLocators.usersPasswordConfirmationInput.fill(userData.password);

        await this.selectRole(userData.role);
        await this.selectCompany(userData.company);
        await this.setCreateFormStatus(userData.Status);

        await this.erpLocators.usersSaveButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Validate duplicate email handling
     */
    async createUserWithDuplicateEmail(userData: UserData) {
        await this.createUser(userData);
        await this.gotoUsersPage();
        await this.openCreateUserForm();
        await this.erpLocators.usersNameInput.fill(userData.name);
        await this.erpLocators.usersEmailInput.fill(userData.email);
        await this.erpLocators.usersPasswordInput.fill(userData.password);
        await this.erpLocators.usersPasswordConfirmationInput.fill(userData.password);
        await this.selectRole(userData.role);
        await this.selectCompany(userData.company);
        await this.erpLocators.usersSaveButton.click();
        await expect(this.erpLocators.userFeildValidationMessage.or(this.erpLocators.usersValidationMessage.first())).toBeVisible();
    }

    /**
     * Validate role required by omitting role
     */
    async createUserWithoutRole(name: string, email: string, password: string, company: string) {
        await this.openCreateUserForm();
        await this.erpLocators.usersNameInput.fill(name);
        await this.erpLocators.usersEmailInput.fill(email);
        await this.erpLocators.usersPasswordInput.fill(password);
        await this.erpLocators.usersPasswordConfirmationInput.fill(password);
        await this.selectCompany(company);
        await this.erpLocators.usersSaveButton.click();
        await expect(this.erpLocators.usersValidationMessage.first()).toBeVisible();
    }

    /**
     * Validate company required by omitting company
     */
    async createUserWithoutCompany(name: string, email: string, password: string, role: string) {
        await this.openCreateUserForm();
        await this.erpLocators.usersNameInput.fill(name);
        await this.erpLocators.usersEmailInput.fill(email);
        await this.erpLocators.usersPasswordInput.fill(password);
        await this.erpLocators.usersPasswordConfirmationInput.fill(password);
        await this.selectRole(role);
        await this.erpLocators.usersSaveButton.click();
        await expect(this.erpLocators.usersValidationMessage.first()).toBeVisible();
    }

    /**
     * Validate invalid company selection
     */
    async createUserWithInvalidCompany(name: string, email: string, password: string, role: string, company: string) {
        await this.openCreateUserForm();
        await this.erpLocators.usersNameInput.fill(name);
        await this.erpLocators.usersEmailInput.fill(email);
        await this.erpLocators.usersPasswordInput.fill(password);
        await this.erpLocators.usersPasswordConfirmationInput.fill(password);
        await this.selectRole(role);
        await this.selectCompany(company, true);
        await this.erpLocators.usersSaveButton.click();
        await expect(this.erpLocators.usersErrorToast.or(this.erpLocators.usersValidationMessage.first())).toBeVisible();
    }

    /**
     * Search users in listing table
     */
    async searchUser(keyword: string) {
        await this.erpLocators.usersSearchInput.fill(keyword);
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Assert user row is visible
     */
    async assertUserVisible(identifier: string) {
        await this.searchUser(identifier);
        await expect(this.page.getByText(identifier).first()).toBeVisible();
    }

    /**
     * Edit user name by opening first matched row action
     */
    async editUserName(searchKey: string, newName: string) {
        await this.searchUser(searchKey);
        await this.erpLocators.usersRowActionsButton.first().click();
        await this.erpLocators.usersEditButton.first().click();
        await this.erpLocators.usersNameInput.fill(newName);
        await this.erpLocators.usersSaveButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Toggle status for first matched user row
     */
    async toggleUserStatus(searchKey: string) {
        await this.searchUser(searchKey);
        await this.erpLocators.usersStatusToggle.first().click();
        await this.expectSuccessFeedback();
    }

    /**
     * Reset password from user action
     */
    async resetUserPassword(searchKey: string, newPassword: string) {
        await this.searchUser(searchKey);
        await this.erpLocators.usersRowActionsButton.first().click();
        await this.erpLocators.usersResetPasswordButton.click();
        await this.erpLocators.usersPasswordInput.fill(newPassword);
        await this.erpLocators.usersPasswordConfirmationInput.fill(newPassword);
        await this.erpLocators.usersSaveButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Delete user from listing
     */
    async deleteUser(searchKey: string) {
        await this.searchUser(searchKey);
        await this.erpLocators.usersRowActionsButton.first().click();
        await this.erpLocators.usersDeleteButton.first().click();
        await this.erpLocators.usersConfirmDeleteButton.click();
        await this.expectSuccessFeedback();
    }

    /**
     * Logout user by opening user menu and clicking logout
     */
    async logout() {
        await this.page.waitForLoadState("networkidle");
        await this.erpLocators.userMenuButton.click();
        await this.erpLocators.logoutButton.click();
        await expect(this.page).toHaveURL(/.*\/admin\/login/);
    }

    /**
     * Attempt login with given credentials (used for negative testing of inactive users)
     */
    async attemptLogin(email: string, password: string) {
        await this.page.goto("/admin/login");
        await this.page.fill('input[type="email"]', email);
        await this.page.fill('input[type="password"]', password);
        await this.page.press('input[type="password"]', "Enter");
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Role selection helper (supports native select and custom dropdown)
     */
    private async selectRole(role: string) {
        const roleSelect = this.erpLocators.usersRoleSelect;
        if (await roleSelect.count()) {
            if (await roleSelect.first().evaluate((el) => el.tagName.toLowerCase() === "select")) {
                await roleSelect.selectOption({ label: role });
                return;
            }
            await roleSelect.click();
            await this.page.getByRole("option", { name: role }).first().click();
        }
    }

    /**
     * Company selection helper (supports native select and custom dropdown)
     */
    private async selectCompany(company: string, allowMissing = false) {
        const companySelect = this.erpLocators.usersCompanySelect;
        if (await companySelect.count()) {
            if (await companySelect.first().evaluate((el) => el.tagName.toLowerCase() === "select")) {
                await companySelect.selectOption({ label: company });
                return;
            }
            await companySelect.click();
            const companySearchInput = this.erpLocators.usersCompanySearchInput.last();
            if (await companySearchInput.isVisible()) {
                await companySearchInput.fill(company);
            }
            const option = this.page.getByRole("option", { name: company }).first();
            if (allowMissing) {
                if (await option.isVisible()) {
                    await option.click();
                }
                return;
            }
            await option.waitFor({ state: "visible" });
            await option.click();
        }
    }

    /**
     * Create-form status toggle helper only
     */
    private async setCreateFormStatus(status?: "Active" | "Inactive") {
        if (!status) {
            return;
        }

        const statusToggle = this.erpLocators.usersCreateStatusToggle;
        if (!await statusToggle.count()) {
            return;
        }

        const toggleState = await statusToggle.first().getAttribute("aria-checked");
        const isActive = toggleState !== "false";
        const shouldBeActive = status === "Active";

        if (isActive !== shouldBeActive) {
            await statusToggle.first().click();
        }
    }

    /**
     * Reusable assertion for success toast/notification
     */
    private async expectSuccessFeedback() {
        await this.page.waitForLoadState("networkidle");
        await expect(this.erpLocators.usersSuccessToast).toBeVisible();
    }
}
