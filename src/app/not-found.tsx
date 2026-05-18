import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-midnight px-4">
      <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
        <span className="text-white font-bold text-xl">ST</span>
      </div>
      <h1 className="text-4xl font-bold text-midnight dark:text-white mb-2">404</h1>
      <p className="text-slate-muted text-sm mb-8">This page doesn&apos;t exist.</p>
      <Link
        href="/en/feed"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet to-violet-dark text-white font-semibold text-sm hover:brightness-110 transition-all"
      >
        Back to Feed
      </Link>
    </div>
  );
}
