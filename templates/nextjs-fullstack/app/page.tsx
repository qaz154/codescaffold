export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">{{PROJECT_NAME}}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">{{DESCRIPTION}}</p>
      <div className="mt-8 flex gap-4">
        <a
          href="/api/health"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          API Health Check
        </a>
      </div>
    </main>
  );
}
