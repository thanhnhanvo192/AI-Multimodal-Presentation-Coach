import { test, expect } from "@playwright/test";

test.describe("Web Testing - Function 5: User Registration Workflow on Web UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");
  });

  test("1. Hiển thị đầy đủ các trường nhập liệu và nút chức năng trên trang đăng ký", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Tạo tài khoản/i })).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator("#terms")).toBeVisible();
    await expect(page.getByRole("button", { name: /Đăng ký/i })).toBeVisible();
  });

  test("2. Kiểm tra xác thực validation khi mật khẩu xác nhận không khớp", async ({ page }) => {
    await page.locator("#name").fill("Nguyễn Văn Mismatched");
    await page.locator("#email").fill("mismatch@student.edu.vn");
    await page.locator("#password").fill("Password123!");
    await page.locator("#confirmPassword").fill("DifferentPass999!");
    await page.locator("#terms").check();

    await page.getByRole("button", { name: /Đăng ký/i }).click();

    await expect(page.getByText("Mật khẩu xác nhận không khớp.")).toBeVisible();
  });

  test("3. Kiểm tra nút đăng ký bị vô hiệu hóa khi người dùng chưa đồng ý điều khoản", async ({ page }) => {
    await page.locator("#name").fill("Trần Thị Test");
    await page.locator("#email").fill("terms@student.edu.vn");
    await page.locator("#password").fill("Password123!");
    await page.locator("#confirmPassword").fill("Password123!");

    // Uncheck điều khoản
    await page.locator("#terms").uncheck();

    // Nút đăng ký phải bị vô hiệu hóa (disabled) để ngăn submit vi phạm điều khoản
    const submitBtn = page.getByRole("button", { name: /Đăng ký/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("4. Đăng ký tài khoản thành công với thông tin hợp lệ và chuyển tiếp đến trang đăng nhập", async ({ page }) => {
    const uniqueEmail = `webuser_${Date.now()}@student.edu.vn`;

    await page.locator("#name").fill("Lê Hoàng Đăng Ký");
    await page.locator("#email").fill(uniqueEmail);
    await page.locator("#password").fill("ValidPass123!");
    await page.locator("#confirmPassword").fill("ValidPass123!");
    await page.locator("#terms").check();

    await page.getByRole("button", { name: /Đăng ký/i }).click();

    // Verify banner thông báo đăng ký thành công
    await expect(page.getByText(/Đăng ký tài khoản thành công/i)).toBeVisible({ timeout: 10000 });

    // Click nút Đến trang Đăng nhập
    const toLoginBtn = page.getByRole("button", { name: /Đến trang Đăng nhập/i });
    await expect(toLoginBtn).toBeVisible();
    await toLoginBtn.click();

    // Kiểm tra đã chuyển hướng về trang /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("heading", { name: /Chào mừng trở lại/i })).toBeVisible();
  });
});
