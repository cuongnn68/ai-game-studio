import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to AI Game Studio
          </h1>
          <p className="text-xl max-w-3xl mb-8">
            Discover amazing games created with the power of artificial
            intelligence. Experience unique gameplay, innovative mechanics, and
            creative worlds.
          </p>

          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/flappy-bird"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-base h-12 px-6"
            >
              Play Flappy Bird
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-base h-12 px-6"
            >
              Explore All Games
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="bg-black/[.03] dark:bg-white/[.03] p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">
              AI-Powered Creativity
            </h2>
            <p className="mb-4">
              Our games leverage cutting-edge AI technologies to create unique
              experiences that blend human creativity with machine intelligence.
            </p>
          </div>
          <div className="bg-black/[.03] dark:bg-white/[.03] p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">
              Featured Game: Flappy Bird
            </h2>
            <p className="mb-4">
              Try our AI-enhanced version of the classic Flappy Bird game.
              Navigate through obstacles and see how high you can score!
            </p>
            <Link
              href="/flappy-bird"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Play Now →
            </Link>
          </div>
        </div>
      </main>
      <footer className="mt-16 py-8 border-t border-black/[.08] dark:border-white/[.145] text-center">
        <div className="container mx-auto">
          <p className="mb-4">
            © 2023 AI Game Studio. All games created with artificial
            intelligence.
          </p>
          <div className="flex gap-6 justify-center">
            <Link
              href="/about"
              className="hover:underline hover:underline-offset-4"
            >
              About
            </Link>
            <Link
              href="/projects"
              className="hover:underline hover:underline-offset-4"
            >
              Games
            </Link>
            <Link
              href="/flappy-bird"
              className="hover:underline hover:underline-offset-4"
            >
              Flappy Bird
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
