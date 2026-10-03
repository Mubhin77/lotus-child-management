import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import logo from "../assets/logo.png";

export default function ParentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/parent",
      icon: "🏠",
    },
    {
      name: "My Child",
      path: "/parent/child",
      icon: "👧",
    },
    {
      name: "Attendance",
      path: "/parent/attendance",
      icon: "📋",
    },
    {
      name: "Daily Reports",
      path: "/parent/reports",
      icon: "📝",
    },
    {
      name: "Notices",
      path: "/parent/notices",
      icon: "📢",
    },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_role");
    localStorage.removeItem("selected_child_id");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#fff8fb]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-white shadow-lg">
        {/* LOGO */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_4px_15px_rgba(233,30,99,0.3)]">
            <img
              src={logo}
              alt="Lotus Montessori Logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text font-['Quicksand'] text-xl font-bold text-transparent">
              Lotus CMS
            </h1>

            <p className="text-xs text-gray-400">Parent Portal</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === "/parent"
                  ? location.pathname === "/parent" ||
                    location.pathname === "/parent/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-pink-50 hover:text-purple-600"
                  }`}
                >
                  <span className="w-6 text-center text-base">{item.icon}</span>

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 rounded-xl bg-purple-50 px-4 py-3">
            <p className="text-xs text-gray-400">Logged in as</p>

            <p className="mt-1 text-sm font-semibold text-purple-700">Parent</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="w-6 text-center">↪</span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}
