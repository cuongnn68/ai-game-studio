"use client";

import { useState, useEffect } from "react";

type Score = {
  name: string;
  score: number;
  date: string;
};

type LeaderboardProps = {
  isOpen: boolean;
  currentScore: number;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export default function Leaderboard({
  isOpen,
  currentScore,
  onClose,
  onSubmit,
  scores,
}: LeaderboardProps & { scores: Score[] }) {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    onSubmit(playerName);
    setPlayerName("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-3 text-gray-800">High Scores</h2>

        {scores.length > 0 ? (
          <div className="mb-3 max-h-48 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 px-3 text-sm font-semibold text-gray-700">
                    Rank
                  </th>
                  <th className="py-2 px-3 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="py-2 px-3 text-sm font-semibold text-gray-700">
                    Score
                  </th>
                  <th className="py-2 px-3 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((score, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="py-2 px-3 text-sm text-gray-800 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-800 font-semibold">
                        {score.name}
                      </td>
                      <td className="py-2 px-3 text-sm text-blue-600 font-semibold">
                        {score.score}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-600">
                        {new Date(score.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mb-3 text-sm text-gray-500">No scores yet!</p>
        )}

        {currentScore > 0 && (
          <form onSubmit={handleSubmit} className="mb-3">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="border border-gray-200 p-2 rounded w-full mb-2 text-sm focus:border-blue-500 focus:outline-none"
              maxLength={20}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors duration-200 w-full"
            >
              Save Score
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors duration-200 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
