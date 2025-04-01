"use client";

import { useState, useEffect } from "react";

type Score = {
  name: string;
  score: number;
  date: string;
};

export default function HighScoreSubmenu({ scores }: { scores: Score[] }) {
  return (
    <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-lg shadow-md w-48">
      <h3 className="text-sm font-bold mb-1 text-gray-800">Top Scores</h3>
      {scores.length > 0 ? (
        <div className="space-y-1">
          {scores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((score, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-xs"
              >
                <span className="font-medium text-gray-700">
                  {index + 1}. {score.name}
                </span>
                <span className="font-bold text-blue-600">{score.score}</span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No scores yet!</p>
      )}
    </div>
  );
}
