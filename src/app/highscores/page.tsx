"use client";

import { useEffect, useState } from "react";
import { Score } from "@/components/Leaderboard";

export default function HighScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [sortField, setSortField] = useState<"score" | "date">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const savedScores = localStorage.getItem("flappyBirdScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  const sortedScores = [...scores].sort((a, b) => {
    if (sortField === "score") {
      return sortOrder === "desc" ? b.score - a.score : a.score - b.score;
    } else {
      return sortOrder === "desc"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    }
  });

  const toggleSort = (field: "score" | "date") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-bold mb-12 text-center text-gray-800">
        Flappy Bird High Scores
      </h1>

      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">
        <div className="flex justify-end mb-6 space-x-4">
          <button
            onClick={() => toggleSort("score")}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
              sortField === "score"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Score {sortField === "score" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => toggleSort("date")}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 ${
              sortField === "date"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Date {sortField === "date" && (sortOrder === "desc" ? "↓" : "↑")}
          </button>
        </div>

        {scores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-lg font-semibold text-gray-700">
                    Rank
                  </th>
                  <th className="py-4 px-6 text-lg font-semibold text-gray-700">
                    Player
                  </th>
                  <th className="py-4 px-6 text-lg font-semibold text-gray-700">
                    Score
                  </th>
                  <th className="py-4 px-6 text-lg font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedScores.map((score, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6 text-lg text-gray-800 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-lg text-gray-800 font-semibold">
                      {score.name}
                    </td>
                    <td className="py-4 px-6 text-lg text-blue-600 font-semibold">
                      {score.score}
                    </td>
                    <td className="py-4 px-6 text-lg text-gray-600">
                      {new Date(score.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xl text-gray-500 py-8">
            No scores recorded yet!
          </p>
        )}
      </div>
    </div>
  );
}
