import { FormEvent, useState } from "react";
import { login, getCurrentUser } from "../../services/authService";
import logo from "../../assets/logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(username, password);

      const user = await getCurrentUser();

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else if (user.role === "teacher") {
        window.location.href = "/teacher";
      } else if (user.role === "parent") {
        window.location.href = "/parent";
      } else {
        setError("Your account does not have a valid role.");
      }
    } catch (error) {
      console.error(error);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_4px_15px_rgba(233,30,99,0.3)]">
            <img
              src={logo}
              alt="Lotus Montessori Logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* School Name */}
          <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
            Lotus Montessori
          </h1>

          {/* Tagline */}
          <p className="mt-2 text-xs font-medium tracking-[2px] text-gray-500">
            NURTURING YOUNG MINDS
          </p>
          <p className="mt-2 text-gray-500">Child Management System</p>
        </div>
        {/* <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold text-white shadow-lg">
            L
          </div>

          <h1 className="text-3xl font-bold text-gray-800">Lotus CMS</h1>

          <p className="mt-2 text-gray-500">Child Management System</p>
        </div>
     */}

        {/* Login Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sign in to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-20 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-purple-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Lotus Pre-school & Child Care Center
        </p>
      </div>
    </div>
  );
}

export default Login;
