"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import HighScoreSubmenu from "@/components/HighScoreSubmenu";

type Score = {
  name: string;
  score: number;
  date: string;
};

// Snake constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 150; // milliseconds per move
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);

  // Game state
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    speed: GAME_SPEED,
  });

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("snakeScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  const handleSaveScore = (name: string) => {
    const newScore = {
      name,
      score,
      date: new Date().toISOString(),
    };

    const updatedScores = [...scores, newScore];
    setScores(updatedScores);
    localStorage.setItem("snakeScores", JSON.stringify(updatedScores));

    resetGame();
  };

  const handleCloseLeaderboard = () => {
    resetGame();
  };

  const resetGame = () => {
    setShowLeaderboard(false);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    gameState.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: DIRECTIONS.RIGHT,
      nextDirection: DIRECTIONS.RIGHT,
      speed: GAME_SPEED,
    };
  };

  // Place food at random position
  const placeFood = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gridWidth = Math.floor(canvas.width / CELL_SIZE);
    const gridHeight = Math.floor(canvas.height / CELL_SIZE);

    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
    } while (
      gameState.current.snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );

    gameState.current.food = newFood;
  };

  // Check collision with walls or self
  const checkCollision = (head: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return true;

    const gridWidth = Math.floor(canvas.width / CELL_SIZE);
    const gridHeight = Math.floor(canvas.height / CELL_SIZE);

    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= gridWidth ||
      head.y < 0 ||
      head.y >= gridHeight
    ) {
      return true;
    }

    // Check self collision (skip the tail as it will move)
    for (let i = 0; i < gameState.current.snake.length - 1; i++) {
      const segment = gameState.current.snake[i];
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }

    return false;
  };

  // Move snake
  const moveSnake = () => {
    const { snake, food, direction } = gameState.current;

    // Calculate new head position
    const head = snake[0];
    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };

    // Check collision
    if (checkCollision(newHead)) {
      setGameOver(true);
      setShowLeaderboard(true);
      return;
    }

    // Add new head
    snake.unshift(newHead);

    // Check if food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      // Increase score
      setScore((prevScore) => prevScore + 10);

      // Increase speed slightly
      gameState.current.speed = Math.max(gameState.current.speed - 5, 50);

      // Place new food
      placeFood();
    } else {
      // Remove tail if no food eaten
      snake.pop();
    }

    // Update direction for next move
    gameState.current.direction = gameState.current.nextDirection;
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) {
        if ((e.key === " " || e.key === "Enter") && !gameOver) {
          setGameStarted(true);
        }
        return;
      }

      const { direction, nextDirection } = gameState.current;

      switch (e.key) {
        case "ArrowUp":
          // Prevent 180-degree turns
          if (direction !== DIRECTIONS.DOWN) {
            gameState.current.nextDirection = DIRECTIONS.UP;
          }
          break;
        case "ArrowDown":
          if (direction !== DIRECTIONS.UP) {
            gameState.current.nextDirection = DIRECTIONS.DOWN;
          }
          break;
        case "ArrowLeft":
          if (direction !== DIRECTIONS.RIGHT) {
            gameState.current.nextDirection = DIRECTIONS.LEFT;
          }
          break;
        case "ArrowRight":
          if (direction !== DIRECTIONS.LEFT) {
            gameState.current.nextDirection = DIRECTIONS.RIGHT;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize food if not placed
    if (!gameState.current.food) {
      placeFood();
    }

    const gameLoop = () => {
      if (!gameStarted || gameOver) return;

      moveSnake();
      drawGame(ctx, canvas.width, canvas.height);

      setTimeout(gameLoop, gameState.current.speed);
    };

    const timerId = setTimeout(gameLoop, gameState.current.speed);
    return () => clearTimeout(timerId);
  }, [gameStarted, gameOver]);

  // Draw game
  const drawGame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw food
    const { food, snake } = gameState.current;
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw snake
    snake.forEach((segment, index) => {
      // Head is darker green, body is lighter green
      ctx.fillStyle = index === 0 ? "#006400" : "#00a000";
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      // Draw eyes on the head
      if (index === 0) {
        ctx.fillStyle = "#ffffff";
        const eyeSize = CELL_SIZE / 5;
        const eyeOffset = CELL_SIZE / 3;

        // Position eyes based on direction
        const { direction } = gameState.current;
        if (direction === DIRECTIONS.RIGHT || direction === DIRECTIONS.LEFT) {
          // Eyes on top for horizontal movement
          ctx.fillRect(
            segment.x * CELL_SIZE + eyeOffset,
            segment.y * CELL_SIZE + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * CELL_SIZE + eyeOffset,
            segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize,
            eyeSize,
            eyeSize
          );
        } else {
          // Eyes on sides for vertical movement
          ctx.fillRect(
            segment.x * CELL_SIZE + eyeOffset,
            segment.y * CELL_SIZE + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize,
            segment.y * CELL_SIZE + eyeOffset,
            eyeSize,
            eyeSize
          );
        }
      }
    });

    // Draw score
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Snake Game</h1>

      {!gameStarted && !gameOver ? (
        <div className="text-center mb-6">
          <p className="mb-4">
            Use arrow keys to control the snake. Eat the red food to grow.
          </p>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </button>
        </div>
      ) : null}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-gray-300"
        />

        {gameOver && !showLeaderboard ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <p className="mb-4">Your score: {score}</p>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
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
        ) : null}
      </div>

      {showLeaderboard && (
        <div className="mt-8 w-full max-w-md">
          <HighScoreSubmenu
            score={score}
            onSave={handleSaveScore}
            onClose={handleCloseLeaderboard}
          />
          <Leaderboard scores={scores} gameTitle="Snake" />
        </div>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to Play</h2>
        <ul className="list-disc pl-5">
          <li>Use arrow keys to control the snake</li>
          <li>Eat the red food to grow and earn points</li>
          <li>Avoid hitting the walls or yourself</li>
          <li>The snake speeds up as you eat more food</li>
        </ul>
      </div>
    </div>
  );
}
