export function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">Blog Admin</h1>
        <a
          href="/api/auth/login"
          className="block w-full rounded bg-gray-900 px-4 py-2 text-center text-white hover:bg-gray-700"
        >
          GitHub でログイン
        </a>
      </section>
    </main>
  );
}
