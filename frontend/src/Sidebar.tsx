import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { BrandLogo } from "./components/common";
import {
  IconDashboard,
  IconStudio,
  IconUpload,
  IconHistory,
  IconUsers,
  IconConfig,
  IconLogs,
  IconSettings,
} from "./components/icons";

export type UserRole = "student" | "admin";

interface SidebarProps {
  userRole: UserRole;
  activeItem: string;
  onNav: (id: string) => void;
  onLogout?: () => void;
}

const STUDENT_NAV = [
  { id: "dashboard", label: "Bảng điều khiển", Icon: IconDashboard },
  { id: "studio", label: "Studio", Icon: IconStudio },
  { id: "upload", label: "Tải Video Lên", Icon: IconUpload },
  { id: "history", label: "Lịch sử", Icon: IconHistory },
  { id: "settings", label: "Cài đặt", Icon: IconSettings },
];

const ADMIN_NAV = [
  { id: "dashboard", label: "Bảng điều khiển", Icon: IconDashboard },
  { id: "users", label: "Người dùng", Icon: IconUsers },
  { id: "config", label: "Cấu hình hệ thống", Icon: IconConfig },
  { id: "logs", label: "Nhật ký máy chủ", Icon: IconLogs },
  { id: "settings", label: "Cài đặt", Icon: IconSettings },
];

export default function Sidebar({ userRole, activeItem, onNav, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const isAdmin = userRole === "admin";
  const navItems = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  const displayName = currentUser?.name || (isAdmin ? "System Administrator" : "Sinh viên");
  const displayAvatar = currentUser?.avatarText || (isAdmin ? "SA" : "SV");
  const displayRoleLabel = (currentUser?.role || userRole) === "admin" ? "Quản trị viên" : "Sinh viên";

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      navigate("/login");
    }
  };

  return (
    <aside className="w-16 md:w-60 flex-shrink-0 bg-white border-r border-[#DCE5DF] flex flex-col py-6 px-2 md:px-4 gap-2 transition-all">
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start px-1 md:px-2 mb-6">
        <BrandLogo
          height={34}
          className="w-full max-w-[48px] md:max-w-[150px] h-auto"
        />
      </div>

      {/* Role badge */}
      <div className="px-1 md:px-2 mb-2 flex justify-center md:justify-start">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-2 md:px-2.5 py-1 rounded-full ${
            isAdmin
              ? "bg-[#F5F7F6] text-[#24312B] border border-[#DCE5DF]"
              : "bg-[#E8F1EB] text-[#276749] border border-[#D4E5D9]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isAdmin ? "bg-[#69766F]" : "bg-[#276749]"
            }`}
          />
          <span className="hidden md:inline">{isAdmin ? "Bảng quản trị" : "Sinh viên"}</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, label, Icon }) => {
          const active = id === activeItem;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={label}
              className={`nav-link flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left w-full transition-colors ${
                active
                  ? "bg-[#E8F1EB] text-[#276749] font-semibold"
                  : "text-[#69766F] hover:bg-[#F5F7F6] hover:text-[#24312B]"
              }`}
            >
              <div className="flex-shrink-0">
                <Icon active={active} />
              </div>
              <span className="hidden md:inline truncate">{label}</span>
              {active && (
                <span className="hidden md:inline ml-auto w-1.5 h-1.5 rounded-full bg-[#276749] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="pt-4 border-t border-[#DCE5DF] flex flex-col md:flex-row items-center justify-center md:justify-between px-1 md:px-2 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isAdmin ? "bg-[#24312B] text-white" : "bg-[#276749] text-white"
            }`}
          >
            <span className="text-white text-[11px] font-bold">
              {displayAvatar}
            </span>
          </div>
          <div className="hidden md:block min-w-0">
            <p className="text-[12.5px] font-semibold text-[#24312B] truncate" title={displayName}>
              {displayName}
            </p>
            <p className="text-[11px] text-[#69766F] truncate">
              {displayRoleLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất"
          aria-label="Đăng xuất"
          className="p-1.5 rounded-lg text-[#69766F] hover:text-[#24312B] hover:bg-[#F5F7F6] transition-colors flex-shrink-0"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 13H3.5a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 3.5 3H6"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M10.5 11l3-3-3-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 8H5.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
