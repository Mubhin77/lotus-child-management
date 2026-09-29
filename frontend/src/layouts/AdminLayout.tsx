import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import logo from "../assets/logo.png";
function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  const navigation = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: "⌂",
    },
    {
      label: "Children",
      path: "/admin/children",
      icon: "👧",
    },
    {
      label: "Teachers",
      path: "/admin/teachers",
      icon: "👩‍🏫",
    },
    {
      label: "Parents",
      path: "/admin/parents",
      icon: "👨‍👩‍👧",
    },
    {
      label: "Classes",
      path: "/admin/classes",
      icon: "🏫",
    },
    {
      label: "Daily Reports",
      path: "/admin/reports",
      icon: "📋",
    },
    {
      label: "Activities",
      path: "/admin/activities",
      icon: "🎨",
    },
    {
      label: "Notices",
      path: "/admin/notices",
      icon: "📢",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fff8fb]">
      {/* Sidebar */}

      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-white shadow-lg">
        {/* Logo */}

        {/* <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-xl font-bold text-white shadow-md">
            <img src={logo} alt="Logo" className="h-6 w-6" />
          </div> */}

            <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-5">
                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_4px_15px_rgba(233,30,99,0.3)]">
                   <img src={logo} alt="Lotus Montessori Logo" className="h-full w-full object-cover"/>
                </div>
                
          <div>
            {/* <h1 className="font-bold text-gray-800">Lotus CMS</h1> */}
            <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text font-['Quicksand'] text-xl font-bold text-transparent">
                 Lotus CMS
            </h1>

            <p className="text-xs text-gray-400">Administration</p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-pink-50 hover:text-purple-600"
                  }`
                }
              >
                <span className="w-6 text-center text-base">{item.icon}</span>

                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom */}

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 rounded-xl bg-purple-50 px-4 py-3">
            <p className="text-xs text-gray-400">Logged in as</p>

            <p className="mt-1 text-sm font-semibold text-purple-700">
              Administrator
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
    </aside>

      {/* Main Area */}

      <main className="ml-64 min-h-screen flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
