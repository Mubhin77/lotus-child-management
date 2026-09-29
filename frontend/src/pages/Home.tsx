export default function Home() {
  return (
    <div className="min-h-screen bg-[#fff8fb]">

      {/* Header */}
      <header className="bg-white border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-pink-600">
              Lotus Montessori
            </h1>

            <p className="text-sm text-gray-500">
              Learning Through Play
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
          >
            Staff & Parent Login
          </button>

        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="max-w-3xl">

          <p className="text-pink-600 font-semibold mb-4">
            Welcome to Lotus Montessori
          </p>

          <h2 className="text-5xl font-bold text-gray-800 leading-tight">
            Where Children Grow Happy
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            A nurturing learning environment where children learn,
            explore, create, and grow through meaningful experiences.
          </p>

        </div>

      </section>

    </div>
  );
}