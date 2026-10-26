import { useState, useRef } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import { Button, Card, Badge } from "./components/common";
import { useAuth } from "./context/AuthContext";

/* ── Form Field Label ────────────────────────────────────── */
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
  placeholder,
  readOnly,
  suffix,
}: {
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-10 bg-[#F5F7F6] text-[#24312B] text-[13px] font-medium rounded-lg px-3.5 outline-none border border-[#DCE5DF] focus:border-[#276749] focus:ring-1 focus:ring-[#276749] focus:bg-white transition-all placeholder:text-[#69766F]/60"
        style={{ paddingRight: suffix ? "3.2rem" : undefined }}
      />
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#69766F] pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ── Password Input with Toggle ──────────────────────────── */
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

/* ── Password Strength Indicator ─────────────────────────── */
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
function AvatarUpload({ avatarText = "SV" }: { avatarText?: string }) {
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
          <div className="w-full h-full bg-[#E8F1EB] flex items-center justify-center text-[#276749] font-bold text-base">
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
        <p className="text-[13.5px] font-semibold text-[#24312B]">Ảnh đại diện</p>
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

/* ── Section Card Component ──────────────────────────────── */
function SettingsSection({
  title,
  subtitle,
  children,
  danger,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Card
      className={`overflow-hidden p-0 ${
        danger ? "border-[#C24141]/40" : "border-[#DCE5DF]"
      }`}
    >
      <div
        className={`px-5 sm:px-6 py-4 border-b ${
          danger
            ? "border-[#C24141]/20 bg-[#C24141]/5"
            : "border-[#DCE5DF] bg-white"
        }`}
      >
        <h2
          className={`text-[14px] font-bold ${
            danger ? "text-[#C24141]" : "text-[#24312B]"
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] text-[#69766F] mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}

/* ── Toast Notification ──────────────────────────────────── */
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

interface SettingsPageProps {
  onNav: (view: string) => void;
  userRole: UserRole;
}

export default function SettingsPage({ onNav, userRole }: SettingsPageProps) {
  const { currentUser } = useAuth();
  const [fullName, setFullName] = useState(() => currentUser?.name || "Đặng Quang Sơn");
  const [email, setEmail] = useState(() => currentUser?.email || "son.dang@student.edu.vn");
  const [wpm, setWpm] = useState("145");
  const [newPassword, setNewPassword] = useState("");
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showToast(msg: string) {
    setToast({ msg, key: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole={userRole} activeItem="settings" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
              Cài đặt tài khoản
            </h1>
            <p className="text-[12px] text-[#69766F]">
              Quản lý thông tin hồ sơ và tùy chọn bảo mật cá nhân
            </p>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-w-2xl w-full">
          {/* Section 1: Thông tin cá nhân */}
          <SettingsSection
            title="Thông tin cá nhân"
            subtitle="Cập nhật ảnh đại diện và thông tin hồ sơ sinh viên của bạn"
          >
            <div className="space-y-5">
              <AvatarUpload avatarText={currentUser?.avatarText || "SV"} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <FieldLabel>Họ và tên</FieldLabel>
                  <FormInput value={fullName} onChange={setFullName} />
                </div>
                <div>
                  <FieldLabel>Địa chỉ Email</FieldLabel>
                  <FormInput value={email} onChange={setEmail} type="email" />
                </div>
              </div>

              <div>
                <FieldLabel>Tốc độ nói mục tiêu</FieldLabel>
                <FormInput
                  value={wpm}
                  onChange={setWpm}
                  type="number"
                  suffix="WPM"
                />
                <p className="text-[11px] text-[#69766F] mt-1.5">
                  Khoảng tối ưu cho thuyết trình đề án: 130 – 160 WPM
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#DCE5DF]">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => showToast("Đã lưu thông tin thành công!")}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Section 2: Bảo mật & Mật khẩu */}
          <SettingsSection
            title="Bảo mật &amp; Mật khẩu"
            subtitle="Thay đổi mật khẩu đăng nhập để bảo vệ tài khoản"
          >
            <div className="space-y-4">
              <div>
                <FieldLabel>Mật khẩu hiện tại</FieldLabel>
                <PasswordInput placeholder="Nhập mật khẩu hiện tại" />
              </div>

              <div>
                <FieldLabel>Mật khẩu mới</FieldLabel>
                <PasswordInput
                  placeholder="Tối thiểu 8 ký tự"
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
                  onClick={() => showToast("Đã cập nhật mật khẩu thành công!")}
                >
                  Cập nhật mật khẩu
                </Button>
              </div>
            </div>
          </SettingsSection>

          {/* Section 3: Vùng nguy hiểm */}
          <SettingsSection title="Vùng nguy hiểm" danger>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[13px] font-bold text-[#C24141]">
                  Xóa vĩnh viễn tài khoản
                </h3>
                <p className="text-[12px] text-[#69766F] mt-0.5">
                  Xóa tài khoản và toàn bộ lịch sử video thuyết trình đã lưu. Hành
                  động này không thể hoàn tác.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Xóa tài khoản
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      showToast("Yêu cầu đã được gửi");
                    }}
                  >
                    Xác nhận
                  </Button>
                </div>
              )}
            </div>
          </SettingsSection>
        </div>
      </main>

      <Toast message={toast?.msg || ""} visible={Boolean(toast)} />
    </div>
  );
}
