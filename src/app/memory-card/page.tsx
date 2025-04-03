"use client";

import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import HighScoreSubmenu from "@/components/HighScoreSubmenu";

type Score = {
  name: string;
  score: number;
  date: string;
};

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

// Card symbols
const CARD_SYMBOLS = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🦆",
  "🦉",
  "🦇",
  "🐺",
  "🐗",
  "🐴",
];

export default function MemoryCard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("memoryCardScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Initialize game
  const initGame = () => {
    let symbolCount;
    switch (difficulty) {
      case "easy":
        symbolCount = 6; // 12 cards (6 pairs)
        break;
      case "medium":
        symbolCount = 12; // 24 cards (12 pairs)
        break;
      case "hard":
        symbolCount = 18; // 36 cards (18 pairs)
        break;
      default:
        symbolCount = 12;
    }

    // Create pairs of cards
    const symbols = CARD_SYMBOLS.slice(0, symbolCount);
    const cardPairs = [...symbols, ...symbols];

    // Shuffle cards
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        flipped: false,
        matched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setTimer(0);

    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);

    setGameStarted(true);
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore if game is over or card is already flipped/matched
    if (gameOver || flippedCards.length >= 2) return;

    const clickedCard = cards.find((card) => card.id === id);
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return;

    // Flip the card
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Update cards state
    setCards(
      cards.map((card) => (card.id === id ? { ...card, flipped: true } : card))
    );

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard?.value === secondCard?.value) {
        // Match found
        setCards(
          cards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card
          )
        );
        setFlippedCards([]);

        // Calculate score based on moves and time
        const matchScore = Math.max(10, 50 - moves);
        setScore((prevScore) => prevScore + matchScore);

        // Check if all cards are matched
        const allMatched = cards.every((card) =>
          card.id === firstId || card.id === secondId ? true : card.matched
        );

        if (allMatched) {
          // Game over - all matches found
          if (timerInterval) clearInterval(timerInterval);
          setTimerInterval(null);

          // Calculate final score based on difficulty, moves and time
          const difficultyMultiplier =
            difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
          const timeBonus = Math.max(0, 300 - timer) * difficultyMultiplier;
          const movesScore =
            Math.max(0, 1000 - moves * 10) * difficultyMultiplier;
          const finalScore = score + timeBonus + movesScore;

          setScore(finalScore);
          setGameOver(true);
          setTimeout(() => setShowLeaderboard(true), 1500);
        }
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setCards(
            cards.map((card) =>
              newFlippedCards.includes(card.id)
                ? { ...card, flipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleSaveScore = (name: string) => {
    const newScore = {
      name,
      score,
      date: new Date().toISOString(),
    };

    const updatedScores = [...scores, newScore];
    setScores(updatedScores);
    localStorage.setItem("memoryCardScores", JSON.stringify(updatedScores));

    resetGame();
  };

  const handleCloseLeaderboard = () => {
    resetGame();
  };

  const resetGame = () => {
    setShowLeaderboard(false);
    setGameOver(false);
    setGameStarted(false);
    setCards([]);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setTimer(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Memory Card Game</h1>

      {!gameStarted ? (
        <div className="text-center mb-6 w-full max-w-md">
          <p className="mb-4">
            Match pairs of cards with the same symbol. Test your memory!
          </p>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Select Difficulty</h2>
            <div className="flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded ${
                  difficulty === "easy"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setDifficulty("easy")}
              >
                Easy
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  difficulty === "medium"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setDifficulty("medium")}
              >
                Medium
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  difficulty === "hard"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setDifficulty("hard")}
              >
                Hard
              </button>
            </div>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={initGame}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Moves: {moves}</div>
            <div className="text-lg font-semibold">
              Time: {formatTime(timer)}
            </div>
            <div className="text-lg font-semibold">Score: {score}</div>
          </div>

          <div
            className={`grid gap-4 mx-auto ${
              difficulty === "easy"
                ? "grid-cols-4"
                : difficulty === "medium"
                ? "grid-cols-6"
                : "grid-cols-6"
            }`}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer text-4xl transition-all duration-300 transform ${
                  card.flipped ? "rotate-y-180" : ""
                } ${
                  card.matched
                    ? "bg-green-100"
                    : card.flipped
                    ? "bg-white"
                    : "bg-blue-500"
                }`}
                style={{
                  perspective: "1000px",
                  height: difficulty === "hard" ? "70px" : "80px",
                  width: difficulty === "hard" ? "70px" : "80px",
                }}
                onClick={() => handleCardClick(card.id)}
              >
                {card.flipped || card.matched ? card.value : ""}
              </div>
            ))}
          </div>

          <button
            className="mt-6 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={resetGame}
          >
            Reset Game
          </button>
        </div>
      )}

      {gameOver && !showLeaderboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Complete!</h2>
            <p className="mb-2">Moves: {moves}</p>
            <p className="mb-2">Time: {formatTime(timer)}</p>
            <p className="mb-4">Final Score: {score}</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => setShowLeaderboard(true)}
            >
              Save Score
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="mt-8 w-full max-w-md">
          <HighScoreSubmenu
            score={score}
            onSave={handleSaveScore}
            onClose={handleCloseLeaderboard}
          />
          <Leaderboard scores={scores} gameTitle="Memory Card" />
        </div>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">How to Play</h2>
        <ul className="list-disc pl-5">
          <li>Click on cards to flip them</li>
          <li>Find matching pairs of symbols</li>
          <li>Complete the game with fewer moves for a higher score</li>
          <li>Faster completion times earn bonus points</li>
        </ul>
      </div>
    </div>
  );
}
