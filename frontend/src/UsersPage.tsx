import { useState } from "react";
import Sidebar from "./Sidebar";
import { User, UserStatus as Status } from "./types";
import { SEED_USERS } from "./mocks/mockUsers";
import { Button, Card } from "./components/common";

const PAGE_SIZE = 10;
const TOTAL = 150;

/* ── Status badge ────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const active = status === "active";
  return (
    <span
      className={`font-medium text-[12.5px] ${
        active ? "text-[#276749]" : "text-[#C24141]"
      }`}
    >
      {active ? "Hoạt động" : "Bị khóa"}
    </span>
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

/* ── Confirm Modal ───────────────────────────────────────── */
function ConfirmModal({
  user,
  action,
  onConfirm,
  onCancel,
}: {
  user: User;
  action: "ban" | "unban";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isBan = action === "ban";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#24312B]/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <Card className="relative bg-white w-full max-w-sm p-6 space-y-4 z-10 border-[#DCE5DF]">
        <h3 className="text-[16px] font-bold text-[#24312B] leading-snug">
          {isBan ? "Khóa tài khoản người dùng?" : "Mở khóa tài khoản?"}
        </h3>
        <p className="text-[12.5px] text-[#69766F] leading-relaxed">
          {isBan ? (
            <>
              Bạn sắp khóa tài khoản{" "}
              <span className="font-semibold text-[#24312B]">{user.name}</span>.
              Sinh viên này sẽ không thể tiếp tục đăng nhập hệ thống.
            </>
          ) : (
            <>
              Khôi phục quyền truy cập hệ thống cho sinh viên{" "}
              <span className="font-semibold text-[#24312B]">{user.name}</span>.
            </>
          )}
        </p>

        <div className="flex gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 justify-center"
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={isBan ? "danger" : "primary"}
            size="sm"
            className="flex-1 justify-center"
            onClick={onConfirm}
          >
            {isBan ? "Xác nhận khóa" : "Mở khóa"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface UsersPageProps {
  onNav: (view: string) => void;
}

export default function UsersPage({ onNav }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [modal, setModal] = useState<{
    user: User;
    action: "ban" | "unban";
  } | null>(null);

  function showToast(msg: string) {
    setToast({ msg, key: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }

  function handleConfirm() {
    if (!modal) return;
    const { user, action } = modal;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: action === "ban" ? "banned" : "active" }
          : u
      )
    );
    showToast(
      action === "ban"
        ? `Đã khóa tài khoản ${user.name}.`
        : `Đã mở khóa tài khoản ${user.name}.`
    );
    setModal(null);
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);

  return (
    <div className="flex h-screen bg-[#F5F7F6] overflow-hidden font-[Inter,sans-serif] text-[#24312B]">
      <Sidebar userRole="admin" activeItem="users" onNav={onNav} />

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b border-[#DCE5DF] px-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <h1 className="text-[17px] font-bold text-[#24312B] tracking-tight leading-tight">
              Quản lý người dùng
            </h1>
            <p className="text-[12px] text-[#69766F]">
              Danh sách tài khoản sinh viên và quyền truy cập hệ thống
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#69766F]"
              width="14"
              height="14"
              viewBox="0 0 15 15"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M10.5 10.5l3 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc MSSV..."
              className="w-full h-9 bg-[#F5F7F6] border border-[#DCE5DF] text-[12.5px] text-[#24312B] font-medium rounded-lg pl-9 pr-3 outline-none focus:border-[#276749] focus:ring-1 focus:ring-[#276749] focus:bg-white transition-all placeholder:text-[#69766F]/60"
            />
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Tổng người dùng", value: TOTAL, sub: "+12 tuần này" },
              {
                label: "Đang hoạt động",
                value: users.filter((u) => u.status === "active").length,
                sub: "Tài khoản bình thường",
                highlight: true,
              },
              {
                label: "Tài khoản bị khóa",
                value: users.filter((u) => u.status === "banned").length,
                sub: "Tạm đình chỉ",
              },
            ].map(({ label, value, sub, highlight }) => (
              <Card key={label} className="p-4 space-y-1">
                <p className="text-[12px] font-medium text-[#69766F]">{label}</p>
                <p
                  className={`text-[22px] font-bold ${
                    highlight ? "text-[#276749]" : "text-[#24312B]"
                  }`}
                >
                  {value}
                </p>
                <p className="text-[11px] text-[#69766F]">{sub}</p>
              </Card>
            ))}
          </div>

          {/* Table Card */}
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[#F5F7F6] border-b border-[#DCE5DF] text-[#69766F] uppercase tracking-wider font-semibold text-[11px]">
                    <th className="px-6 py-3.5">Mã người dùng</th>
                    <th className="px-6 py-3.5">Họ và tên</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Số phiên luyện</th>
                    <th className="px-6 py-3.5">Trạng thái</th>
                    <th className="px-6 py-3.5">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF]">
                  {filtered.map((user) => {
                    const isBanned = user.status === "banned";
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-[#F5F7F6]/50 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-mono text-[#69766F]">
                          {user.id}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-[#24312B]">
                          {user.name}
                        </td>
                        <td className="px-6 py-3.5 text-[#69766F]">
                          {user.email}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-[#24312B]">
                          {user.sessions} phiên
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-6 py-3.5">
                          {isBanned ? (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="w-20 justify-center"
                              onClick={() =>
                                setModal({ user, action: "unban" })
                              }
                            >
                              Mở khóa
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="w-20 justify-center hover:text-[#C24141] hover:border-[#C24141]/40"
                              onClick={() => setModal({ user, action: "ban" })}
                            >
                              Khóa
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#DCE5DF] text-[12px] text-[#69766F] bg-white">
              <span>
                Hiển thị {filtered.length}/{TOTAL} người dùng
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <span className="px-2 font-medium text-[#24312B]">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {modal && (
        <ConfirmModal
          user={modal.user}
          action={modal.action}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      <Toast message={toast?.msg || ""} visible={Boolean(toast)} />
    </div>
  );
}
