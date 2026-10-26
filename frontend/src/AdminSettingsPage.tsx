import { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import { Button, Card } from "./components/common";
import { useAuth } from "./context/AuthContext";

/* ── Field Label ─────────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11.5px] font-semibold text-[#69766F] uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

/* ── Standard Text Input ─────────────────────────────────── */
function FormInput({
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full h-10 bg-[#F5F7F6] text-[#24312B] text-[13px] font-medium rounded-lg px-3.5 outline-none border border-[#DCE5DF] focus:border-[#276749] focus:ring-1 focus:ring-[#276749] focus:bg-white transition-all placeholder:text-[#69766F]/60"
    />
  );
}

/* ── Password Input ──────────────────────────────────────── */
function PasswordInput({
  placeholder,
  onChange,
}: {
  placeholder: string;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center h-10 bg-[#F5F7F6] rounded-lg border border-[#DCE5DF] focus-within:border-[#276749] focus-within:ring-1 focus-within:ring-[#276749] focus-within:bg-white transition-all overflow-hidden">
      <input
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        className="flex-1 bg-transparent text-[#24312B] text-[13px] font-medium px-3.5 outline-none placeholder:text-[#69766F]/60"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="px-3.5 text-[12px] font-medium text-[#69766F] hover:text-[#24312B] transition-colors"
      >
        {show ? "Ẩn" : "Hiện"}
      </button>
    </div>
  );
}

/* ── Password Strength ───────────────────────────────────── */
function PasswordStrength({ value }: { value: string }) {
  const score =
    value.length === 0
      ? 0
      : value.length < 6
      ? 1
      : value.length < 10
      ? 2
      : /[A-Z]/.test(value) && /[0-9]/.test(value)
      ? 4
      : 3;
  const labels = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];
  if (value.length === 0) return null;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex gap-1.5 flex-1">
        {[1, 2, 3, 4].map((b) => (
          <div
            key={b}
            className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
              b <= score ? "bg-[#276749]" : "bg-[#DCE5DF]"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-[#276749]">
        {labels[score]}
      </span>
    </div>
  );
}

/* ── Avatar Uploader ─────────────────────────────────────── */
function AvatarUpload({ avatarText = "SA" }: { avatarText?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div
        className="relative w-16 h-16 rounded-full cursor-pointer flex-shrink-0 border-2 border-[#DCE5DF] hover:border-[#276749] transition-colors overflow-hidden"
        onClick={() => ref.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#24312B] flex items-center justify-center text-white font-bold text-base">
            {avatarText}
          </div>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div className="space-y-1">
        <p className="text-[13.5px] font-semibold text-[#24312B]">
          Ảnh đại diện quản trị
        </p>
        <p className="text-[11.5px] text-[#69766F]">
          Hỗ trợ JPG, PNG hoặc WebP · Tối đa 5 MB
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => ref.current?.click()}
          className="mt-1"
        >
          Tải ảnh lên
        </Button>
      </div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#24312B] text-white text-[12.5px] font-medium px-4 py-3 rounded-xl border border-white/10 animate-fade-in">
      <span className="text-[#276749] bg-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
        ✓
      </span>
      <span>{message}</span>
    </div>
  );
}

interface AdminSettingsPageProps {
  onNav: (view: string) => void;
  onLogout: () => void;
}

export default function AdminSettingsPage({
  onNav,
  onLogout,
}: AdminSettingsPageProps) {
  const { currentUser } = useAuth();
  const [adminName, setAdminName] = useState(() => currentUser?.name || "System Administrator");
  const [adminEmail, setAdminEmail] = useState(() => currentUser?.email || "admin@system.edu.vn");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  function showToast(msg: string) {
    setToast({ msg, key: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole="admin" activeItem="settings" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
              Cài đặt quản trị viên
            </h1>
            <p className="text-[12px] text-[#69766F]">
              Quản lý tài khoản quản trị hệ thống và cấu hình bảo mật
            </p>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-2xl w-full">
          {/* Card 1: Thông tin quản trị */}
          <Card className="overflow-hidden p-0">
            <div className="px-5 sm:px-6 py-4 border-b border-[#DCE5DF] bg-white">
              <h2 className="text-[14px] font-bold text-[#24312B]">
                Thông tin quản trị viên
              </h2>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Cập nhật thông tin nhận diện tài khoản root/admin
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <AvatarUpload avatarText={currentUser?.avatarText || "SA"} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <FieldLabel>Tên hiển thị</FieldLabel>
                  <FormInput value={adminName} onChange={setAdminName} />
                </div>
                <div>
                  <FieldLabel>Địa chỉ Email</FieldLabel>
                  <FormInput
                    value={adminEmail}
                    onChange={setAdminEmail}
                    type="email"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#DCE5DF]">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => showToast("Đã lưu thông tin quản trị!")}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 2: Bảo mật & Mật khẩu */}
          <Card className="overflow-hidden p-0">
            <div className="px-5 sm:px-6 py-4 border-b border-[#DCE5DF] bg-white">
              <h2 className="text-[14px] font-bold text-[#24312B]">
                Bảo mật &amp; Đổi mật khẩu
              </h2>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Đảm bảo mật khẩu quản trị có độ phức tạp cao
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <FieldLabel>Mật khẩu hiện tại</FieldLabel>
                <PasswordInput placeholder="Nhập mật khẩu hiện tại" />
              </div>

              <div>
                <FieldLabel>Mật khẩu mới</FieldLabel>
                <PasswordInput
                  placeholder="Tối thiểu 8 ký tự, gồm số & chữ hoa"
                  onChange={setNewPassword}
                />
                <PasswordStrength value={newPassword} />
              </div>

              <div>
                <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                <PasswordInput placeholder="Nhập lại mật khẩu mới" />
              </div>

              <div className="flex justify-end pt-3 border-t border-[#DCE5DF]">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => showToast("Đã đổi mật khẩu quản trị thành công!")}
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 3: Phiên đăng nhập & Đăng xuất */}
          <Card className="overflow-hidden p-0 border-[#C24141]/30">
            <div className="px-5 sm:px-6 py-4 border-b border-[#C24141]/20 bg-[#C24141]/5">
              <h2 className="text-[14px] font-bold text-[#C24141]">
                Phiên làm việc quản trị
              </h2>
              <p className="text-[12px] text-[#69766F] mt-0.5">
                Đăng xuất khỏi quyền truy cập hệ thống trên thiết bị này
              </p>
            </div>
            <div className="p-5 sm:px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#24312B]">
                  Đăng xuất tài khoản
                </p>
                <p className="text-[11.5px] text-[#69766F] mt-0.5">
                  Kết thúc phiên làm việc an toàn của Administrator.
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={onLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Toast message={toast?.msg || ""} visible={Boolean(toast)} />
    </div>
  );
}
