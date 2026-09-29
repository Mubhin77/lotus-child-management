import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export default function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      name: "Dashboard",
      path: "/teacher",
      icon: "🏠",
    },
    {
      name: "My Children",
      path: "/teacher/children",
      icon: "👧",
    },
    {
      name: "Daily Reports",
      path: "/teacher/reports",
      icon: "📝",
    },
    {
      name: "Notices",
      path: "/teacher/notices",
      icon: "📢",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#fff8fb] flex">

      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-white border-r border-pink-100 flex flex-col min-h-screen">

        {/* Logo */}
        <div className="px-6 py-7 border-b border-pink-100">
          <h1 className="text-2xl font-bold text-pink-600">
            Lotus CMS
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Teacher Portal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {navItems.map((item) => {
            const isActive =
              item.path === "/teacher"
                ? location.pathname === "/teacher"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-pink-100 text-pink-700 font-semibold"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <span className="text-lg w-6 text-center">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            );
          })}

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-pink-100">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <span className="text-lg w-6 text-center">
              🚪
            </span>

            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 min-h-screen">
        <Outlet />
      </main>

    </div>
  );
}