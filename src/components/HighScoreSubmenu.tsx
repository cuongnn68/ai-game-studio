"use client";

type Score = {
  name: string;
  score: number;
  date: string;
};

type HighScoreSubmenuProps = {
  scores?: Score[];
  onSave?: (name: string) => void;
  onClose?: () => void;
};

export default function HighScoreSubmenu({
  scores = [],
  onSave,
  onClose,
}: HighScoreSubmenuProps) {
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
      {onSave && onClose && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Enter your name"
            className="border border-gray-200 p-1 rounded text-xs"
            maxLength={20}
          />
          <div className="flex justify-between gap-1">
            <button
              onClick={onClose}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave("Player")}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
