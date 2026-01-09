import { test, expect, testData, helpers } from "./fixtures";

test.describe("Kanban Board", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to jobs page
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);
  });

  test("should display jobs list", async ({ page }) => {
    // Check that we're on the jobs page
    await expect(page).toHaveURL(/\/jobs/);

    // Should show the jobs heading
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible();
  });

  test("should navigate to job board when clicking a job", async ({ page }) => {
    // Click on the first job card
    const firstJob = page.locator("[data-testid='job-card']").first();

    // If there are no jobs, skip this test
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();

    // Should navigate to job board
    await expect(page).toHaveURL(/\/jobs\/[a-z0-9-]+$/);
  });

  test("should show admin controls for admin users", async ({ page }) => {
    // Go to first job
    const firstJob = page.locator("[data-testid='job-card']").first();
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();
    await helpers.waitForAppReady(page);

    // Admin should see Add Column button
    await expect(page.getByRole("button", { name: /add column/i })).toBeVisible();
  });
});

test.describe("Add Task Dialog", () => {
  test("should open add task dialog when clicking add button", async ({ page }) => {
    // Navigate to a job board first
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    const firstJob = page.locator("[data-testid='job-card']").first();
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();
    await helpers.waitForAppReady(page);

    // Find any "Add Task" button
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    const buttonCount = await addTaskButton.count();
    if (buttonCount === 0) {
      test.skip(true, "No columns with add task button");
      return;
    }

    await addTaskButton.click();

    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/add task/i)).toBeVisible();
  });

  test("should create a new task", async ({ page }) => {
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    const firstJob = page.locator("[data-testid='job-card']").first();
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();
    await helpers.waitForAppReady(page);

    // Click add task button
    const addTaskButton = page.getByRole("button", { name: /add task/i }).first();
    await addTaskButton.click();

    // Fill form
    const taskTitle = `Test Task ${Date.now()}`;
    await page.getByLabel(/title/i).fill(taskTitle);
    await page.getByLabel(/description/i).fill("This is a test task created by Playwright");

    // Select priority
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /high/i }).click();

    // Submit
    await page.getByRole("button", { name: /create task/i }).click();

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Task should appear on the board
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});

test.describe("Add Column Dialog", () => {
  test("should open add column dialog when clicking add column button", async ({ page }) => {
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    const firstJob = page.locator("[data-testid='job-card']").first();
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();
    await helpers.waitForAppReady(page);

    // Click add column button
    const addColumnButton = page.getByRole("button", { name: /add column/i });
    const buttonCount = await addColumnButton.count();
    if (buttonCount === 0) {
      test.skip(true, "Add column button not visible (not admin?)");
      return;
    }

    await addColumnButton.click();

    // Dialog should open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/add column/i)).toBeVisible();
  });

  test("should create a new column", async ({ page }) => {
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    const firstJob = page.locator("[data-testid='job-card']").first();
    const jobCount = await firstJob.count();
    if (jobCount === 0) {
      test.skip(true, "No jobs available to test");
      return;
    }

    await firstJob.click();
    await helpers.waitForAppReady(page);

    // Click add column button
    const addColumnButton = page.getByRole("button", { name: /add column/i });
    await addColumnButton.click();

    // Fill form
    const columnName = `Test Column ${Date.now()}`;
    await page.getByLabel(/column name/i).fill(columnName);

    // Select a color (click the second color option)
    await page.locator("button[title]").nth(1).click();

    // Submit
    await page.getByRole("button", { name: /create column/i }).click();

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Column should appear on the board
    await expect(page.getByText(columnName)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate between pages using sidebar", async ({ page }) => {
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    // Check sidebar is visible on desktop
    const sidebar = page.locator("[data-sidebar='sidebar']");
    const isSidebarVisible = await sidebar.isVisible();

    if (!isSidebarVisible) {
      // Mobile view - skip sidebar test
      test.skip(true, "Sidebar not visible (mobile view)");
      return;
    }

    // Click on Admin Dashboard link
    await page.getByRole("link", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // Click on Jobs link
    await page.getByRole("link", { name: /jobs/i }).click();
    await expect(page).toHaveURL(/\/jobs/);
  });

  test("should toggle theme", async ({ page }) => {
    await page.goto("/jobs");
    await helpers.waitForAppReady(page);

    // Find theme toggle button
    const themeToggle = page.getByRole("button", { name: /toggle theme/i });

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const htmlElement = page.locator("html");
      const initialClass = await htmlElement.getAttribute("class");
      const wasDark = initialClass?.includes("dark");

      // Toggle theme
      await themeToggle.click();

      // Check theme changed
      const newClass = await htmlElement.getAttribute("class");
      const isDark = newClass?.includes("dark");

      expect(isDark).not.toBe(wasDark);
    }
  });
});
