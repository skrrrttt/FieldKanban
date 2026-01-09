import { test as base, expect, type Page } from "@playwright/test";

/**
 * Custom test fixtures for FieldKanban
 */
export const test = base.extend({
  // No additional fixtures needed - auth is handled via storageState in config
});

export { expect };
export type { Page };

/**
 * Test data helpers
 */
export const testData = {
  // Test user credentials
  testUser: {
    email: "test-user@fieldkanban.test",
    name: "Test Admin",
    role: "admin" as const,
  },

  // Test job data
  sampleJob: {
    title: "Test Parking Lot Striping",
    description: "Repaint all parking stalls and fire lanes",
    clientName: "ABC Property Management",
    address: "123 Test Street, City, ST 12345",
  },

  // Test column names
  defaultColumns: ["Backlog", "In Progress", "Review", "Complete"],

  // Test task data
  sampleTask: {
    title: "Paint handicap stalls",
    description: "Repaint 4 handicap stalls with blue paint",
    priority: "high" as const,
  },
};

/**
 * Page helper functions
 */
export const helpers = {
  /**
   * Wait for the app to finish loading
   */
  async waitForAppReady(page: Page) {
    // Wait for skeleton to disappear
    await page.waitForSelector('[data-testid="loading"]', { state: "hidden" }).catch(() => {
      // Ignore if loading indicator doesn't exist
    });

    // Wait for main content
    await page.waitForLoadState("networkidle");
  },

  /**
   * Navigate to a job board
   */
  async goToJobBoard(page: Page, jobId: string) {
    await page.goto(`/jobs/${jobId}`);
    await helpers.waitForAppReady(page);
  },

  /**
   * Create a task via the UI
   */
  async createTask(
    page: Page,
    columnName: string,
    taskData: { title: string; description?: string; priority?: string }
  ) {
    // Find the column
    const column = page.locator(`[data-column-name="${columnName}"]`);

    // Click add task button
    await column.getByRole("button", { name: /add task/i }).click();

    // Fill the form
    await page.getByLabel(/title/i).fill(taskData.title);

    if (taskData.priority) {
      await page.getByRole("combobox").click();
      await page.getByRole("option", { name: taskData.priority }).click();
    }

    if (taskData.description) {
      await page.getByLabel(/description/i).fill(taskData.description);
    }

    // Submit
    await page.getByRole("button", { name: /create task/i }).click();

    // Wait for dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  },

  /**
   * Create a column via the UI
   */
  async createColumn(page: Page, columnName: string) {
    // Click add column button
    await page.getByRole("button", { name: /add column/i }).click();

    // Fill the form
    await page.getByLabel(/column name/i).fill(columnName);

    // Submit
    await page.getByRole("button", { name: /create column/i }).click();

    // Wait for dialog to close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  },

  /**
   * Drag a task to another column
   */
  async dragTaskToColumn(page: Page, taskTitle: string, targetColumn: string) {
    const task = page.getByText(taskTitle);
    const column = page.locator(`[data-column-name="${targetColumn}"]`);

    await task.dragTo(column);
  },
};
