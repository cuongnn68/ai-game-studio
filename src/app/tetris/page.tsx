"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import HighScoreSubmenu from "@/components/HighScoreSubmenu";

type Score = {
  name: string;
  score: number;
  date: string;
};

// Tetris constants
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;
const GAME_SPEED = 500; // milliseconds per move

// Tetromino shapes
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f0a000",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a000f0",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#f00000",
  },
};

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);

  // Game state
  const gameState = useRef({
    board: Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0)),
    currentPiece: null as any,
    currentPosition: { x: 0, y: 0 },
    nextPiece: null as any,
    gameSpeed: GAME_SPEED,
  });

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("tetrisScores");
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
    localStorage.setItem("tetrisScores", JSON.stringify(updatedScores));

    resetGame();
  };

  const handleCloseLeaderboard = () => {
    resetGame();
  };

  const resetGame = () => {
    setShowLeaderboard(false);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameStarted(false);
    gameState.current = {
      board: Array(GRID_HEIGHT)
        .fill(null)
        .map(() => Array(GRID_WIDTH).fill(0)),
      currentPiece: null,
      currentPosition: { x: 0, y: 0 },
      nextPiece: null,
      gameSpeed: GAME_SPEED,
    };
  };

  // Generate random tetromino
  const getRandomTetromino = () => {
    const tetrominoTypes = Object.keys(TETROMINOES) as Array<
      keyof typeof TETROMINOES
    >;
    const randomType =
      tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    return {
      ...TETROMINOES[randomType],
      type: randomType,
    };
  };

  // Initialize game
  const initGame = () => {
    if (!gameState.current.currentPiece) {
      gameState.current.currentPiece = getRandomTetromino();
      gameState.current.currentPosition = {
        x:
          Math.floor(GRID_WIDTH / 2) -
          Math.floor(gameState.current.currentPiece.shape[0].length / 2),
        y: 0,
      };
    }

    if (!gameState.current.nextPiece) {
      gameState.current.nextPiece = getRandomTetromino();
    }
  };

  // Check collision
  const checkCollision = (piece: any, position: { x: number; y: number }) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const boardX = position.x + x;
          const boardY = position.y + y;

          // Check boundaries
          if (
            boardX < 0 ||
            boardX >= GRID_WIDTH ||
            boardY >= GRID_HEIGHT ||
            // Check collision with existing pieces
            (boardY >= 0 && gameState.current.board[boardY][boardX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Rotate piece
  const rotatePiece = (piece: any) => {
    const rotatedPiece = {
      ...piece,
      shape: piece.shape[0].map((_: any, index: number) =>
        piece.shape.map((row: any) => row[index]).reverse()
      ),
    };

    // Check if rotation is valid
    if (!checkCollision(rotatedPiece, gameState.current.currentPosition)) {
      gameState.current.currentPiece = rotatedPiece;
    }
  };

  // Move piece
  const movePiece = (dx: number, dy: number) => {
    const newPosition = {
      x: gameState.current.currentPosition.x + dx,
      y: gameState.current.currentPosition.y + dy,
    };

    if (!checkCollision(gameState.current.currentPiece, newPosition)) {
      gameState.current.currentPosition = newPosition;
      return true;
    }
    return false;
  };

  // Lock piece in place
  const lockPiece = () => {
    const { currentPiece, currentPosition, board } = gameState.current;

    // Add piece to board
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;

          if (boardY < 0) {
            // Game over if piece is above the board
            setGameOver(true);
            setShowLeaderboard(true);
            return;
          }

          board[boardY][boardX] = currentPiece.color;
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (board[y].every((cell: any) => cell !== 0)) {
        // Remove the line
        board.splice(y, 1);
        // Add a new empty line at the top
        board.unshift(Array(GRID_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same row again
      }
    }

    // Update score and level
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, 4 lines
      const newScore = score + linePoints[linesCleared] * level;
      setScore(newScore);
      setLines(lines + linesCleared);

      // Level up every 10 lines
      const newLevel = Math.floor((lines + linesCleared) / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        gameState.current.gameSpeed = Math.max(
          GAME_SPEED - (newLevel - 1) * 50,
          100
        );
      }
    }

    // Get next piece
    gameState.current.currentPiece = gameState.current.nextPiece;
    gameState.current.nextPiece = getRandomTetromino();
    gameState.current.currentPosition = {
      x:
        Math.floor(GRID_WIDTH / 2) -
        Math.floor(gameState.current.currentPiece.shape[0].length / 2),
      y: 0,
    };

    // Check if game over
    if (
      checkCollision(
        gameState.current.currentPiece,
        gameState.current.currentPosition
      )
    ) {
      setGameOver(true);
      setShowLeaderboard(true);
    }
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

      switch (e.key) {
        case "ArrowLeft":
          movePiece(-1, 0);
          break;
        case "ArrowRight":
          movePiece(1, 0);
          break;
        case "ArrowDown":
          movePiece(0, 1);
          break;
        case "ArrowUp":
          rotatePiece(gameState.current.currentPiece);
          break;
        case " ": // Space for hard drop
          while (movePiece(0, 1)) {}
          lockPiece();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver, score, level, lines]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    initGame();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = 0;
    let dropCounter = 0;

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;

      if (dropCounter > gameState.current.gameSpeed) {
        dropCounter = 0;
        if (!movePiece(0, 1)) {
          lockPiece();
        }
      }

      drawGame(ctx, canvas.width, canvas.height);
      if (!gameOver) {
        requestAnimationFrame(gameLoop);
      }
    };

    requestAnimationFrame(gameLoop);
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

    // Draw board
    const { board, currentPiece, currentPosition, nextPiece } =
      gameState.current;

    // Draw grid
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw locked pieces
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (board[y][x] !== 0) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = "#000";
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const drawX = (currentPosition.x + x) * CELL_SIZE;
            const drawY = (currentPosition.y + y) * CELL_SIZE;
            ctx.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Draw next piece preview
    if (nextPiece) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(GRID_WIDTH * CELL_SIZE + 20, 0, 150, 150);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(GRID_WIDTH * CELL_SIZE + 20, 0, 150, 150);

      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText("Next Piece:", GRID_WIDTH * CELL_SIZE + 40, 30);

      ctx.fillStyle = nextPiece.color;
      for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
          if (nextPiece.shape[y][x] !== 0) {
            const drawX = GRID_WIDTH * CELL_SIZE + 60 + x * CELL_SIZE;
            const drawY = 50 + y * CELL_SIZE;
            ctx.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Draw score, level, and lines
    ctx.fillStyle = "#fff";
    ctx.fillRect(GRID_WIDTH * CELL_SIZE + 20, 170, 150, 150);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(GRID_WIDTH * CELL_SIZE + 20, 170, 150, 150);

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, GRID_WIDTH * CELL_SIZE + 40, 200);
    ctx.fillText(`Level: ${level}`, GRID_WIDTH * CELL_SIZE + 40, 230);
    ctx.fillText(`Lines: ${lines}`, GRID_WIDTH * CELL_SIZE + 40, 260);

    // Draw controls
    ctx.fillStyle = "#fff";
    ctx.fillRect(GRID_WIDTH * CELL_SIZE + 20, 340, 150, 180);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(GRID_WIDTH * CELL_SIZE + 20, 340, 150, 180);

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText("Controls:", GRID_WIDTH * CELL_SIZE + 40, 370);
    ctx.font = "14px Arial";
    ctx.fillText("← → : Move", GRID_WIDTH * CELL_SIZE + 40, 400);
    ctx.fillText("↑ : Rotate", GRID_WIDTH * CELL_SIZE + 40, 430);
    ctx.fillText("↓ : Soft Drop", GRID_WIDTH * CELL_SIZE + 40, 460);
    ctx.fillText("Space : Hard Drop", GRID_WIDTH * CELL_SIZE + 40, 490);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Tetris</h1>

      {!gameStarted && !gameOver ? (
        <div className="text-center mb-6">
          <p className="mb-4">Press Space or Enter to start the game</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </button>
        </div>
      ) : null}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_WIDTH * CELL_SIZE + 200}
          height={GRID_HEIGHT * CELL_SIZE}
          className="border border-gray-300"
        />

        {gameOver && !showLeaderboard ? (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <p className="mb-4">Your score: {score}</p>
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
        ) : null}
      </div>

      {showLeaderboard && (
        <div className="mt-8 w-full max-w-md">
          <HighScoreSubmenu
            score={score}
            onSave={handleSaveScore}
            onClose={handleCloseLeaderboard}
          />
          <Leaderboard scores={scores} gameTitle="Tetris" />
        </div>
      )}
    </div>
  );
}
