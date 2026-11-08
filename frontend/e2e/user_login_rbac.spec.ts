import { test, expect } from "@playwright/test";

test.describe("Web Testing - Function 6: User Authentication & Role-Based Navigation on Web UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
  });

  test("1. Hiển thị giao diện đăng nhập, nút điền nhanh demo và các trường thông tin", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Chào mừng trở lại/i })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByText(/Điền nhanh tài khoản Demo/i)).toBeVisible();
  });

  test("2. Kiểm tra tính năng ẩn / hiện mật khẩu (Show/Hide Password Toggle)", async ({ page }) => {
    const passwordInput = page.locator("#password");
    await passwordInput.fill("SecretPassword2026");

    // Mặc định type là password
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Nhấn nút Toggle mật khẩu
    const toggleBtn = page.locator("button[aria-label*='mật khẩu']");
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Nhấn lại để Ẩn mật khẩu
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("3. Kiểm tra thông báo lỗi khi đăng nhập sai mật khẩu", async ({ page }) => {
    await page.locator("#email").fill("student@university.edu.vn");
    await page.locator("#password").fill("WrongSecretPass999!");

    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Verify thông báo lỗi hiển thị trên UI
    const alertBox = page.getByRole("alert");
    await expect(alertBox).toBeVisible({ timeout: 10000 });
    await expect(alertBox).toContainText(/Email hoặc mật khẩu không chính xác/i);
  });

  test("4. Đăng nhập thành công với vai trò Sinh viên và điều hướng chính xác vào /dashboard", async ({ page }) => {
    // Click chọn tài khoản Sinh viên Demo
    const studentPreset = page.getByText(/Sinh viên Demo/i).first();
    if (await studentPreset.isVisible()) {
      await studentPreset.click();
    } else {
      await page.locator("#email").fill("son.dang@student.edu.vn");
      await page.locator("#password").fill("Student@123");
    }

    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Verify điều hướng tới trang /dashboard của sinh viên
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Verify token được lưu trữ trong localStorage
    const token = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(token).toBeTruthy();
  });

  test("5. Đăng nhập thành công với vai trò Quản trị viên và điều hướng chính xác vào /admin/dashboard", async ({ page }) => {
    // Click chọn tài khoản Admin Quản trị
    const adminPreset = page.getByText(/Admin Quản trị/i).first();
    if (await adminPreset.isVisible()) {
      await adminPreset.click();
    } else {
      await page.locator("#email").fill("admin@system.edu.vn");
      await page.locator("#password").fill("Admin@123");
    }

    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Verify điều hướng tới trang /admin/dashboard
    await expect(page).toHaveURL(/.*\/admin/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Bảng điều khiển Quản trị/i })).toBeVisible({ timeout: 10000 });

    // Verify trạng thái role được ghi nhận là admin trong auth_user
    const authUser = await page.evaluate(() => {
      const u = localStorage.getItem("auth_user");
      return u ? JSON.parse(u) : null;
    });
    expect(authUser?.role).toBe("admin");
  });
});
