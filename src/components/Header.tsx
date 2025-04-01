"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          AI Game Studio
        </Link>

        <div className="flex gap-6">
          <Link href="/about" className="hover:opacity-80 transition-opacity">
            About
          </Link>
          <Link
            href="/projects"
            className="hover:opacity-80 transition-opacity"
          >
            Projects
          </Link>
          <Link
            href="/flappy-bird"
            className="hover:opacity-80 transition-opacity"
          >
            Flappy Bird
          </Link>
        </div>
      </nav>
    </header>
  );
}
