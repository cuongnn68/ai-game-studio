export default function Projects() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI-Created Games</h1>
      <p className="text-lg mb-8">
        Explore our collection of games created with the help of artificial
        intelligence. Each game showcases unique AI-generated elements, from
        graphics to gameplay mechanics.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Flappy Bird AI</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our AI-enhanced version of the classic Flappy Bird game. Features
            multiple themes and a global leaderboard.
          </p>
          <a
            href="/flappy-bird"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Play Now →
          </a>
        </div>
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Snake Game</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Control a snake as it grows longer by eating food. Avoid hitting
            walls and yourself in this AI-enhanced classic.
          </p>
          <a
            href="/snake"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Play Now →
          </a>
        </div>
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Tetris</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Arrange falling blocks to create complete lines in this AI-enhanced
            version of the iconic puzzle game.
          </p>
          <a
            href="/tetris"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Play Now →
          </a>
        </div>
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Memory Card Game</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Test your memory by matching pairs of cards. Features multiple
            difficulty levels and a scoring system.
          </p>
          <a
            href="/memory-card"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Play Now →
          </a>
        </div>
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Cosmic Defender</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            An AI-generated space shooter with procedurally generated levels and
            enemies. Coming soon!
          </p>
          <span className="text-gray-500 dark:text-gray-400">Coming Soon</span>
        </div>
        <div className="border border-black/[.08] dark:border-white/[.145] rounded-lg p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Puzzle Quest AI</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            A mind-bending puzzle game where each level is designed by AI to
            challenge your problem-solving skills.
          </p>
          <span className="text-gray-500 dark:text-gray-400">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
