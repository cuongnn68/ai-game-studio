"use client";

import { useEffect, useRef, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import HighScoreSubmenu from "@/components/HighScoreSubmenu";
import ThemeSelector from "@/components/ThemeSelector";

type Score = {
  name: string;
  score: number;
  date: string;
};

const GRAVITY = 0.3;
const JUMP_FORCE = -8;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const UFO_SIZE = 40;
const PULSE_SPEED = 0.1;

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);
  const [currentTheme, setCurrentTheme] = useState("ufo");

  useEffect(() => {
    const savedScores = localStorage.getItem("flappyBirdScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  const gameState = useRef({
    birdY: 250,
    birdVelocity: 0,
    pipes: [] as { x: number; topHeight: number; scored?: boolean }[],
    wingFlap: 0,
  });

  const handleSaveScore = (name: string) => {
    const newScore = {
      name,
      score,
      date: new Date().toISOString(),
    };

    const updatedScores = [...scores, newScore];
    setScores(updatedScores);
    localStorage.setItem("flappyBirdScores", JSON.stringify(updatedScores));

    setShowLeaderboard(false);
    setGameOver(false);
    setScore(0);
    gameState.current = {
      birdY: 250,
      birdVelocity: 0,
      pipes: [],
      wingFlap: 0,
    };
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    setGameOver(false);
    setScore(0);
    gameState.current = {
      birdY: 250,
      birdVelocity: 0,
      pipes: [],
      wingFlap: 0,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    // Remove unused variable

    const addPipe = () => {
      const topHeight = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
      gameState.current.pipes.push({
        x: canvas.width,
        topHeight,
        scored: false,
      });
    };

    const update = () => {
      if (!gameStarted || gameOver) return;

      // Update bird
      gameState.current.birdVelocity += GRAVITY;
      gameState.current.birdY += gameState.current.birdVelocity;
      gameState.current.wingFlap = (gameState.current.wingFlap + 0.2) % Math.PI;

      // Update pipes
      gameState.current.pipes.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;
      });

      // Remove off-screen pipes
      gameState.current.pipes = gameState.current.pipes.filter(
        (pipe) => pipe.x + PIPE_WIDTH > 0
      );

      // Add new pipes
      if (
        gameState.current.pipes.length === 0 ||
        canvas.width -
          gameState.current.pipes[gameState.current.pipes.length - 1].x >
          300
      ) {
        addPipe();
      }

      // Check collisions
      const ufo = {
        x: 50,
        y: gameState.current.birdY,
        width: UFO_SIZE,
        height: UFO_SIZE / 2,
      };

      // Ground/ceiling collision
      if (
        gameState.current.birdY <= 0 ||
        gameState.current.birdY + UFO_SIZE / 2 >= canvas.height
      ) {
        setGameOver(true);
        return;
      }

      // Pipe collision
      for (const pipe of gameState.current.pipes) {
        // Adjust hitbox for dragon theme's fire pillars and rocket theme's asteroids
        if (currentTheme === "dragon" || currentTheme === "rocket") {
          // For dragon theme and rocket theme, use a circular hitbox to match the visual obstacles
          const obstacleRadius =
            PIPE_WIDTH * (currentTheme === "rocket" ? 0.4 : 0.4); // Radius of the circular hitbox

          // Calculate centers of the obstacles (fire pillars or asteroids)
          const topObstacleCenterX = pipe.x + PIPE_WIDTH / 2;
          const topObstacleCenterY = pipe.topHeight / 2;

          const bottomObstacleCenterX = pipe.x + PIPE_WIDTH / 2;
          const bottomObstacleCenterY =
            pipe.topHeight +
            PIPE_GAP +
            (canvas.height - (pipe.topHeight + PIPE_GAP)) / 2;

          // Calculate center of the UFO/rocket
          const playerCenterX = ufo.x + ufo.width / 2;
          const playerCenterY = ufo.y + ufo.height / 2;

          // Calculate distances between player and obstacles
          const distToTopObstacle = Math.sqrt(
            Math.pow(playerCenterX - topObstacleCenterX, 2) +
              Math.pow(playerCenterY - topObstacleCenterY, 2)
          );

          const distToBottomObstacle = Math.sqrt(
            Math.pow(playerCenterX - bottomObstacleCenterX, 2) +
              Math.pow(playerCenterY - bottomObstacleCenterY, 2)
          );

          // Check if player is within the obstacle radius
          // For rocket theme, use a slightly smaller hitbox for the player to match the visual
          const playerRadius =
            currentTheme === "rocket"
              ? Math.max(ufo.width, ufo.height) / 3 // Smaller hitbox for rocket
              : Math.max(ufo.width, ufo.height) / 2; // Normal hitbox for dragon

          if (
            (distToTopObstacle < obstacleRadius + playerRadius &&
              ufo.y < pipe.topHeight) ||
            (distToBottomObstacle < obstacleRadius + playerRadius &&
              ufo.y + ufo.height > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
            return;
          }
        } else {
          // Default collision detection for other themes
          if (
            ufo.x + ufo.width > pipe.x &&
            ufo.x < pipe.x + PIPE_WIDTH &&
            (ufo.y < pipe.topHeight ||
              ufo.y + ufo.height > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
            return;
          }
        }

        // Score point
        if (!pipe.scored && pipe.x + PIPE_WIDTH / 2 < ufo.x) {
          setScore((prev) => prev + 1);
          pipe.scored = true;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background based on theme
      switch (currentTheme) {
        case "rocket":
          // Space background with static stars
          const spaceGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
          );
          spaceGradient.addColorStop(0, "#000033");
          spaceGradient.addColorStop(1, "#0A0A2A");
          ctx.fillStyle = spaceGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add static stars with fixed positions
          ctx.fillStyle = "white";
          for (let i = 0; i < 100; i++) {
            // Use a deterministic pattern for star positions
            const x = (i * 23) % canvas.width;
            const y = (i * 29) % canvas.height;
            // Vary star sizes in a predictable pattern
            const size = (i % 4) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Add a distant planet
          const planetX = canvas.width * 0.2;
          const planetY = canvas.height * 0.7;
          const planetRadius = 25;
          const planetGradient = ctx.createRadialGradient(
            planetX,
            planetY,
            0,
            planetX,
            planetY,
            planetRadius
          );
          planetGradient.addColorStop(0, "rgba(255, 100, 100, 0.6)");
          planetGradient.addColorStop(0.5, "rgba(255, 100, 100, 0.3)");
          planetGradient.addColorStop(1, "rgba(255, 100, 100, 0)");
          ctx.fillStyle = planetGradient;
          ctx.beginPath();
          ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "butterfly":
          // Meadow background with gradient sky
          const meadowGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
          );
          meadowGradient.addColorStop(0, "#87CEEB");
          meadowGradient.addColorStop(0.7, "#E0F7FA");
          meadowGradient.addColorStop(1, "#81C784");
          ctx.fillStyle = meadowGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add some clouds
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          for (let i = 0; i < 5; i++) {
            const x =
              (((Date.now() / 10000 + i / 5) % 1.2) - 0.1) * canvas.width;
            const y = 50 + i * 30;
            drawCloud(ctx, x, y, 60 + i * 10);
          }
          break;

        case "dragon":
          // Castle/volcano background
          const volcanoGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
          );
          volcanoGradient.addColorStop(0, "#4A0404");
          volcanoGradient.addColorStop(0.6, "#701C1C");
          volcanoGradient.addColorStop(1, "#5D4037");
          ctx.fillStyle = volcanoGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add distant mountains
          ctx.fillStyle = "#3E2723";
          ctx.beginPath();
          ctx.moveTo(0, canvas.height * 0.7);
          for (let x = 0; x < canvas.width; x += 50) {
            const height = Math.sin(x / 30) * 50 + 100;
            ctx.lineTo(x, canvas.height - height);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.fill();
          break;

        case "ghost":
          // Haunted night background
          const hauntedGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
          );
          hauntedGradient.addColorStop(0, "#0D0D2B");
          hauntedGradient.addColorStop(1, "#1A1A3A");
          ctx.fillStyle = hauntedGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add a moon
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 40, 0, Math.PI * 2);
          ctx.fill();

          // Add fog
          ctx.fillStyle = "rgba(200, 200, 255, 0.1)";
          for (let i = 0; i < 3; i++) {
            const y = canvas.height * (0.3 + i * 0.2);
            const amplitude = 50;
            const frequency = 0.01;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < canvas.width; x += 10) {
              ctx.lineTo(
                x,
                y + Math.sin((x + Date.now() / 1000) * frequency) * amplitude
              );
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.fill();
          }
          break;

        case "paperplane":
          // Blue sky with clouds
          ctx.fillStyle = "#B3E5FC";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add some paper-like texture
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 30 + 10;
            ctx.fillRect(x, y, size, size);
          }

          // Add clouds
          ctx.fillStyle = "white";
          for (let i = 0; i < 3; i++) {
            const x =
              (((Date.now() / 15000 + i / 3) % 1.2) - 0.1) * canvas.width;
            const y = 80 + i * 60;
            drawCloud(ctx, x, y, 80);
          }
          break;

        case "balloon":
          // Festive sky background
          const festiveGradient = ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
          );
          festiveGradient.addColorStop(0, "#64B5F6");
          festiveGradient.addColorStop(1, "#90CAF9");
          ctx.fillStyle = festiveGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add static confetti
          // Using a fixed seed for random positions
          const confettiColors = [
            "#FF5252",
            "#FFEB3B",
            "#4CAF50",
            "#2196F3",
            "#9C27B0",
          ];

          for (let i = 0; i < 50; i++) {
            // Use fixed positions based on index instead of random
            const x = (i * 37) % canvas.width;
            const y = (i * 23) % canvas.height;
            const size = (i % 4) + 2;
            ctx.fillStyle = confettiColors[i % confettiColors.length];
            ctx.fillRect(x, y, size, size);
          }
          break;

        case "robot":
          // Futuristic tech background
          const techGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          techGradient.addColorStop(0, "#263238");
          techGradient.addColorStop(1, "#37474F");
          ctx.fillStyle = techGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add static grid lines
          ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
          ctx.lineWidth = 1;
          const gridSize = 30;
          for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Add static glowing dots with fixed positions
          for (let i = 0; i < 20; i++) {
            // Use fixed positions based on a pattern
            const x = (canvas.width / 20) * (i % 5) + canvas.width / 5;
            const y =
              (canvas.height / 20) * Math.floor(i / 5) + canvas.height / 5;
            const size = (i % 3) + 1;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glow.addColorStop(0, "rgba(0, 229, 255, 0.8)");
            glow.addColorStop(1, "rgba(0, 229, 255, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          break;

        default: // UFO theme
          // Space background with static stars and nebula
          const ufoGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          ufoGradient.addColorStop(0, "#0D1B2A");
          ufoGradient.addColorStop(1, "#1B263B");
          ctx.fillStyle = ufoGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add static stars with fixed positions
          ctx.fillStyle = "white";
          for (let i = 0; i < 150; i++) {
            // Use a deterministic pattern for star positions
            const x = (i * 17) % canvas.width;
            const y = (i * 19) % canvas.height;
            // Vary star sizes in a predictable pattern
            const size = (i % 3) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Add static nebula
          const nebulaX = canvas.width * 0.7;
          const nebulaY = canvas.height * 0.3;
          const nebulaRadius = 100;
          const nebulaGradient = ctx.createRadialGradient(
            nebulaX,
            nebulaY,
            0,
            nebulaX,
            nebulaY,
            nebulaRadius
          );
          nebulaGradient.addColorStop(0, "rgba(138, 43, 226, 0.2)");
          nebulaGradient.addColorStop(0.5, "rgba(138, 43, 226, 0.1)");
          nebulaGradient.addColorStop(1, "rgba(138, 43, 226, 0)");
          ctx.fillStyle = nebulaGradient;
          ctx.beginPath();
          ctx.arc(nebulaX, nebulaY, nebulaRadius, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      // Helper function to draw clouds
      function drawCloud(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number
      ): void {
        const numCircles = 5;
        for (let i = 0; i < numCircles; i++) {
          const circleX = x + (i - numCircles / 2) * (size / numCircles);
          const circleY = y + Math.sin((i * Math.PI) / 3) * (size / 10);
          const circleSize =
            size / 3 - Math.abs(i - numCircles / 2) * (size / 10);
          ctx.beginPath();
          ctx.arc(circleX, circleY, circleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw character based on theme
      const birdX = 50;
      const birdY = gameState.current.birdY;
      const rotation = Math.min(
        Math.max(gameState.current.birdVelocity * 0.1, -0.5),
        0.5
      );

      ctx.save();
      ctx.translate(birdX + UFO_SIZE / 2, birdY + UFO_SIZE / 2);
      ctx.rotate(rotation);

      switch (currentTheme) {
        case "rocket":
          // Rocket body
          ctx.fillStyle = "#FF4500";
          ctx.beginPath();
          ctx.moveTo(-UFO_SIZE / 4, UFO_SIZE / 4);
          ctx.lineTo(UFO_SIZE / 4, 0);
          ctx.lineTo(-UFO_SIZE / 4, -UFO_SIZE / 4);
          ctx.closePath();
          ctx.fill();

          // Flame effect
          const flameSize =
            3 + Math.sin(gameState.current.wingFlap * PULSE_SPEED) * 2;
          ctx.fillStyle = "#FFA500";
          ctx.beginPath();
          ctx.moveTo(-UFO_SIZE / 4, 0);
          ctx.lineTo(-UFO_SIZE / 2 - flameSize, UFO_SIZE / 6);
          ctx.lineTo(-UFO_SIZE / 2 - flameSize, -UFO_SIZE / 6);
          ctx.closePath();
          ctx.fill();
          break;

        case "butterfly":
          // Wings
          const wingFlap = Math.sin(gameState.current.wingFlap) * 0.5;
          ctx.fillStyle = "#9370DB";

          // Left wing
          ctx.beginPath();
          ctx.ellipse(
            -UFO_SIZE / 4,
            0,
            UFO_SIZE / 3,
            UFO_SIZE / 4,
            wingFlap,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Right wing
          ctx.beginPath();
          ctx.ellipse(
            UFO_SIZE / 4,
            0,
            UFO_SIZE / 3,
            UFO_SIZE / 4,
            -wingFlap,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Body
          ctx.fillStyle = "#4B0082";
          ctx.beginPath();
          ctx.ellipse(0, 0, UFO_SIZE / 8, UFO_SIZE / 3, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "dragon":
          // Dragon head
          ctx.fillStyle = "#8B0000";
          ctx.beginPath();
          ctx.ellipse(0, 0, UFO_SIZE / 3, UFO_SIZE / 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dragon horns
          ctx.fillStyle = "#A52A2A";
          ctx.beginPath();
          ctx.moveTo(0, -UFO_SIZE / 4);
          ctx.lineTo(UFO_SIZE / 6, -UFO_SIZE / 2);
          ctx.lineTo(-UFO_SIZE / 6, -UFO_SIZE / 2);
          ctx.closePath();
          ctx.fill();

          // Fire breath
          const fireSize =
            4 + Math.sin(gameState.current.wingFlap * PULSE_SPEED * 2) * 3;
          const fireGradient = ctx.createRadialGradient(
            UFO_SIZE / 3,
            0,
            0,
            UFO_SIZE / 3,
            0,
            fireSize * 2
          );
          fireGradient.addColorStop(0, "#FF4500");
          fireGradient.addColorStop(0.5, "#FFA500");
          fireGradient.addColorStop(1, "rgba(255, 255, 0, 0)");

          ctx.fillStyle = fireGradient;
          ctx.beginPath();
          ctx.arc(UFO_SIZE / 3, 0, fireSize * 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "ghost":
          // Ghost body with transparency
          ctx.fillStyle = "rgba(230, 230, 250, 0.7)";
          ctx.beginPath();
          ctx.arc(0, -UFO_SIZE / 6, UFO_SIZE / 3, 0, Math.PI * 2);
          ctx.fill();

          // Ghost tail
          ctx.beginPath();
          const waveAmount = Math.sin(gameState.current.wingFlap) * 5;
          ctx.moveTo(-UFO_SIZE / 3, -UFO_SIZE / 6);
          ctx.quadraticCurveTo(
            -UFO_SIZE / 6,
            UFO_SIZE / 4 + waveAmount,
            0,
            UFO_SIZE / 3
          );
          ctx.quadraticCurveTo(
            UFO_SIZE / 6,
            UFO_SIZE / 4 - waveAmount,
            UFO_SIZE / 3,
            -UFO_SIZE / 6
          );
          ctx.fill();

          // Ghost eyes
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(-UFO_SIZE / 8, -UFO_SIZE / 6, UFO_SIZE / 12, 0, Math.PI * 2);
          ctx.arc(UFO_SIZE / 8, -UFO_SIZE / 6, UFO_SIZE / 12, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "paperplane":
          // Paper plane body
          ctx.fillStyle = "#F0F8FF";
          ctx.beginPath();
          ctx.moveTo(UFO_SIZE / 3, 0);
          ctx.lineTo(-UFO_SIZE / 3, -UFO_SIZE / 4);
          ctx.lineTo(-UFO_SIZE / 6, 0);
          ctx.lineTo(-UFO_SIZE / 3, UFO_SIZE / 4);
          ctx.closePath();
          ctx.fill();

          // Paper fold lines
          ctx.strokeStyle = "#A9A9A9";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-UFO_SIZE / 6, 0);
          ctx.lineTo(UFO_SIZE / 3, 0);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(-UFO_SIZE / 6, 0);
          ctx.lineTo(-UFO_SIZE / 3, -UFO_SIZE / 4);
          ctx.stroke();
          break;

        case "balloon":
          // Balloon body that expands and contracts
          const balloonSize = 1 + Math.sin(gameState.current.wingFlap) * 0.1;
          ctx.fillStyle = "#FF69B4";
          ctx.beginPath();
          ctx.arc(0, 0, (UFO_SIZE / 3) * balloonSize, 0, Math.PI * 2);
          ctx.fill();

          // Balloon tie
          ctx.fillStyle = "#FF1493";
          ctx.beginPath();
          ctx.ellipse(
            0,
            UFO_SIZE / 3,
            UFO_SIZE / 12,
            UFO_SIZE / 8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Balloon string
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, UFO_SIZE / 3 + UFO_SIZE / 8);

          // Wavy string
          for (let i = 1; i <= 5; i++) {
            const xOffset = Math.sin(gameState.current.wingFlap + i) * 3;
            ctx.lineTo(
              xOffset,
              UFO_SIZE / 3 + UFO_SIZE / 8 + (i * UFO_SIZE) / 10
            );
          }
          ctx.stroke();
          break;

        case "robot":
          // Robot head
          ctx.fillStyle = "#4682B4";
          ctx.fillRect(
            -UFO_SIZE / 3,
            -UFO_SIZE / 3,
            (UFO_SIZE * 2) / 3,
            (UFO_SIZE * 2) / 3
          );

          // Robot antenna
          ctx.fillStyle = "#B0C4DE";
          ctx.fillRect(
            -UFO_SIZE / 12,
            -UFO_SIZE / 2,
            UFO_SIZE / 6,
            UFO_SIZE / 6
          );

          // Robot eyes
          const blinkRate = Math.sin(gameState.current.wingFlap * 0.5);
          const eyeHeight = blinkRate > 0.7 ? 1 : UFO_SIZE / 8;

          ctx.fillStyle = blinkRate > 0.7 ? "#FF0000" : "#00FFFF";
          ctx.fillRect(-UFO_SIZE / 5, -UFO_SIZE / 6, UFO_SIZE / 8, eyeHeight);
          ctx.fillRect(UFO_SIZE / 10, -UFO_SIZE / 6, UFO_SIZE / 8, eyeHeight);

          // Robot mouth
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-UFO_SIZE / 5, UFO_SIZE / 8);
          ctx.lineTo(UFO_SIZE / 5, UFO_SIZE / 8);
          ctx.stroke();
          break;

        default: // UFO theme
          // UFO body (metallic saucer)
          ctx.fillStyle = "#C0C0C0";
          ctx.beginPath();
          ctx.ellipse(0, 0, UFO_SIZE / 2, UFO_SIZE / 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#808080";
          ctx.lineWidth = 2;
          ctx.stroke();

          // UFO dome
          ctx.fillStyle = "rgba(135, 206, 235, 0.6)";
          ctx.beginPath();
          ctx.ellipse(
            0,
            -UFO_SIZE / 8,
            UFO_SIZE / 3,
            UFO_SIZE / 3,
            0,
            Math.PI,
            0
          );
          ctx.fill();

          // Pulsing lights
          const lightColors = ["#FF0000", "#00FF00", "#0000FF"];
          const numLights = 3;
          for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2;
            const x = Math.cos(angle) * (UFO_SIZE / 3);
            const y = Math.sin(angle) * (UFO_SIZE / 6);
            const pulseSize =
              3 + Math.sin(gameState.current.wingFlap * PULSE_SPEED) * 2;

            ctx.fillStyle = lightColors[i];
            ctx.beginPath();
            ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }

      ctx.restore();

      // Draw obstacles based on theme
      gameState.current.pipes.forEach((pipe) => {
        switch (currentTheme) {
          case "rocket":
            // Space asteroids
            ctx.fillStyle = "#A0522D";

            // Top asteroid
            drawAsteroid(ctx, pipe.x + PIPE_WIDTH / 2, pipe.topHeight / 2);

            // Bottom asteroid
            drawAsteroid(
              ctx,
              pipe.x + PIPE_WIDTH / 2,
              pipe.topHeight +
                PIPE_GAP +
                (canvas.height - (pipe.topHeight + PIPE_GAP)) / 2
            );
            break;

          case "butterfly":
            // Trees and flowers
            // Top tree
            drawTree(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom tree
            drawTree(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          case "dragon":
            // Fire pillars
            // Top fire pillar
            drawFirePillar(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom fire pillar
            drawFirePillar(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          case "ghost":
            // Haunted mansion towers
            // Top tower
            drawHauntedTower(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom tower
            drawHauntedTower(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          case "paperplane":
            // Paper shredders/fans
            // Top shredder
            drawPaperShredder(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom shredder
            drawPaperShredder(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          case "balloon":
            // Pins/needles
            // Top pin
            drawPin(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom pin
            drawPin(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          case "robot":
            // Electric barriers
            // Top barrier
            drawElectricBarrier(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom barrier
            drawElectricBarrier(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;

          default: // UFO theme
            // Alien structures
            // Top structure
            drawAlienStructure(ctx, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

            // Bottom structure
            drawAlienStructure(
              ctx,
              pipe.x,
              pipe.topHeight + PIPE_GAP,
              PIPE_WIDTH,
              canvas.height - (pipe.topHeight + PIPE_GAP)
            );
            break;
        }
      });

      // Helper functions for drawing obstacles
      function drawAsteroid(
        ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number
      ): void {
        const radius = PIPE_WIDTH * 0.8;
        ctx.fillStyle = "#A0522D";
        ctx.beginPath();

        // Create irregular asteroid shape
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          const bumpiness = 0.8 + Math.random() * 0.4;
          const x = centerX + Math.cos(angle) * radius * bumpiness;
          const y = centerY + Math.sin(angle) * radius * bumpiness;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();
        ctx.fill();

        // Add crater details
        ctx.fillStyle = "#8B4513";
        for (let i = 0; i < 5; i++) {
          const craterX = centerX + (Math.random() - 0.5) * radius * 1.2;
          const craterY = centerY + (Math.random() - 0.5) * radius * 1.2;
          const craterSize = 2 + Math.random() * 5;
          ctx.beginPath();
          ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawTree(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Tree trunk
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(x + width / 3, y, width / 3, height);

        // Add leaves/branches if this is a top tree
        if (y === 0) {
          // Leaves
          ctx.fillStyle = "#228B22";
          for (let i = 0; i < 3; i++) {
            const leafY = height - height * (i * 0.25 + 0.25);
            const leafWidth = width * (0.5 + i * 0.25);
            ctx.beginPath();
            ctx.moveTo(x + width / 2, leafY);
            ctx.lineTo(x + width / 2 - leafWidth / 2, leafY + height * 0.15);
            ctx.lineTo(x + width / 2 + leafWidth / 2, leafY + height * 0.15);
            ctx.closePath();
            ctx.fill();
          }

          // Add some flowers
          ctx.fillStyle = "#FF69B4";
          for (let i = 0; i < 5; i++) {
            const flowerX = x + width / 2 + (Math.random() - 0.5) * width * 0.8;
            const flowerY = height - height * (Math.random() * 0.5 + 0.25);
            const flowerSize = 3 + Math.random() * 3;
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, flowerSize, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Roots for bottom tree
          ctx.strokeStyle = "#8B4513";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const rootY = y + Math.random() * height * 0.2;
            ctx.beginPath();
            ctx.moveTo(x + width / 2, y);
            ctx.quadraticCurveTo(
              x + width / 2 + (Math.random() - 0.5) * width,
              rootY,
              x + width / 2 + (Math.random() - 0.5) * width * 2,
              rootY
            );
            ctx.stroke();
          }
        }
      }

      function drawFirePillar(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Base structure (dark stone)
        ctx.fillStyle = "#444";
        ctx.fillRect(x, y, width, height);

        // Animated flames
        const flameGradient = ctx.createLinearGradient(x, y, x, y + height);
        if (y === 0) {
          // Top pillar flames go down
          flameGradient.addColorStop(0.7, "rgba(255, 0, 0, 0)");
          flameGradient.addColorStop(0.8, "rgba(255, 69, 0, 0.8)");
          flameGradient.addColorStop(0.9, "rgba(255, 165, 0, 0.9)");
          flameGradient.addColorStop(1, "rgba(255, 255, 0, 1)");
        } else {
          // Bottom pillar flames go up
          flameGradient.addColorStop(0, "rgba(255, 255, 0, 1)");
          flameGradient.addColorStop(0.1, "rgba(255, 165, 0, 0.9)");
          flameGradient.addColorStop(0.2, "rgba(255, 69, 0, 0.8)");
          flameGradient.addColorStop(0.3, "rgba(255, 0, 0, 0)");
        }

        ctx.fillStyle = flameGradient;
        ctx.fillRect(x, y, width, height);

        // Add some ember particles
        ctx.fillStyle = "#FFA500";
        for (let i = 0; i < 10; i++) {
          const emberX = x + Math.random() * width;
          const emberY =
            y +
            (y === 0
              ? height * (0.8 + Math.random() * 0.2)
              : height * Math.random() * 0.2);
          const emberSize = 1 + Math.random() * 2;
          ctx.beginPath();
          ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawHauntedTower(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Main tower structure
        ctx.fillStyle = "#483D8B";
        ctx.fillRect(x, y, width, height);

        // Add windows
        ctx.fillStyle = "#E6E6FA";
        const windowCount = Math.floor(height / 30);
        for (let i = 0; i < windowCount; i++) {
          const windowY = y + (i + 0.5) * (height / (windowCount + 1));
          ctx.fillRect(x + width * 0.3, windowY, width * 0.4, height * 0.05);
        }

        // Add tower top (only for top towers)
        if (y === 0) {
          ctx.fillStyle = "#483D8B";
          ctx.beginPath();
          ctx.moveTo(x - width * 0.2, height);
          ctx.lineTo(x + width * 0.5, height - height * 0.2);
          ctx.lineTo(x + width * 1.2, height);
          ctx.closePath();
          ctx.fill();
        }

        // Add some ghostly mist
        ctx.fillStyle = "rgba(230, 230, 250, 0.3)";
        for (let i = 0; i < 3; i++) {
          const mistY =
            y + (y === 0 ? height * (0.7 + i * 0.1) : height * (i * 0.1));
          const waveX = Math.sin(Date.now() / 1000 + i) * width * 0.3;
          ctx.beginPath();
          ctx.ellipse(
            x + width / 2 + waveX,
            mistY,
            width * 0.7,
            height * 0.05,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      function drawPaperShredder(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Main structure
        ctx.fillStyle = "#A9A9A9";
        ctx.fillRect(x, y, width, height);

        // Shredder teeth
        ctx.fillStyle = "#D3D3D3";
        const teethCount = 5;
        const teethWidth = width / teethCount;

        for (let i = 0; i < teethCount; i++) {
          if (y === 0) {
            // Top shredder teeth point down
            const teethHeight =
              height * 0.1 + Math.sin(Date.now() / 200 + i) * height * 0.05;
            ctx.fillRect(
              x + i * teethWidth,
              height - teethHeight,
              teethWidth * 0.8,
              teethHeight
            );
          } else {
            // Bottom shredder teeth point up
            const teethHeight =
              height * 0.1 + Math.sin(Date.now() / 200 + i) * height * 0.05;
            ctx.fillRect(x + i * teethWidth, y, teethWidth * 0.8, teethHeight);
          }
        }

        // Add some paper scraps
        ctx.fillStyle = "white";
        for (let i = 0; i < 8; i++) {
          const scrapX = x + Math.random() * width;
          const scrapY =
            y +
            (y === 0
              ? height * (0.9 + Math.random() * 0.1)
              : height * Math.random() * 0.1);
          const scrapWidth = 2 + Math.random() * 5;
          const scrapHeight = 5 + Math.random() * 10;
          ctx.fillRect(scrapX, scrapY, scrapWidth, scrapHeight);
        }
      }

      function drawPin(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Pin body
        ctx.fillStyle = "#C0C0C0";

        if (y === 0) {
          // Top pin points down
          // Pin head
          ctx.fillStyle = "#FF6347";
          ctx.beginPath();
          ctx.arc(
            x + width / 2,
            height - height * 0.1,
            width * 0.4,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Pin body
          ctx.fillStyle = "#C0C0C0";
          ctx.beginPath();
          ctx.moveTo(x + width * 0.4, 0);
          ctx.lineTo(x + width * 0.6, 0);
          ctx.lineTo(x + width * 0.55, height - height * 0.15);
          ctx.lineTo(x + width * 0.45, height - height * 0.15);
          ctx.closePath();
          ctx.fill();

          // Pin point
          ctx.fillStyle = "#A9A9A9";
          ctx.beginPath();
          ctx.moveTo(x + width * 0.45, height - height * 0.15);
          ctx.lineTo(x + width * 0.5, height);
          ctx.lineTo(x + width * 0.55, height - height * 0.15);
          ctx.closePath();
          ctx.fill();
        } else {
          // Bottom pin points up
          // Pin head
          ctx.fillStyle = "#FF6347";
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height * 0.1, width * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Pin body
          ctx.fillStyle = "#C0C0C0";
          ctx.beginPath();
          ctx.moveTo(x + width * 0.4, y + height);
          ctx.lineTo(x + width * 0.6, y + height);
          ctx.lineTo(x + width * 0.55, y + height * 0.15);
          ctx.lineTo(x + width * 0.45, y + height * 0.15);
          ctx.closePath();
          ctx.fill();

          // Pin point
          ctx.fillStyle = "#A9A9A9";
          ctx.beginPath();
          ctx.moveTo(x + width * 0.45, y + height * 0.15);
          ctx.lineTo(x + width * 0.5, y);
          ctx.lineTo(x + width * 0.55, y + height * 0.15);
          ctx.closePath();
          ctx.fill();
        }
      }

      function drawElectricBarrier(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Main structure
        ctx.fillStyle = "#444";
        ctx.fillRect(x, y, width, height);

        // Electric field
        const zapCount = Math.floor(height / 20);
        ctx.strokeStyle = `rgba(0, 255, 255, ${
          0.5 + Math.sin(Date.now() / 100) * 0.5
        })`;
        ctx.lineWidth = 2;

        for (let i = 0; i < zapCount; i++) {
          const zapY = y + (i + 0.5) * (height / (zapCount + 1));
          ctx.beginPath();
          ctx.moveTo(x, zapY);

          let currentX = x;
          while (currentX < x + width) {
            currentX += 5;
            const randomY = zapY + (Math.random() - 0.5) * 10;
            ctx.lineTo(currentX, randomY);
          }

          ctx.stroke();
        }

        // Add some electric nodes
        for (let i = 0; i < 3; i++) {
          const nodeY = y + (i + 0.5) * (height / 4);
          const glowSize = 5 + Math.sin(Date.now() / 200 + i) * 2;

          const glow = ctx.createRadialGradient(
            x + width / 2,
            nodeY,
            0,
            x + width / 2,
            nodeY,
            glowSize * 2
          );
          glow.addColorStop(0, "rgba(0, 255, 255, 0.8)");
          glow.addColorStop(1, "rgba(0, 255, 255, 0)");

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x + width / 2, nodeY, glowSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function drawAlienStructure(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ): void {
        // Main structure
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, "#1A237E");
        gradient.addColorStop(1, "#3949AB");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Add some alien tech patterns
        ctx.strokeStyle = "rgba(64, 196, 255, 0.7)";
        ctx.lineWidth = 1;

        // Circular patterns
        for (let i = 0; i < 3; i++) {
          const circleY = y + (i + 0.5) * (height / 4);
          const circleSize = width * 0.6;
          ctx.beginPath();
          ctx.arc(x + width / 2, circleY, circleSize / 2, 0, Math.PI * 2);
          ctx.stroke();

          // Inner circle
          ctx.beginPath();
          ctx.arc(x + width / 2, circleY, circleSize / 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Add glowing parts
        for (let i = 0; i < 5; i++) {
          const glowX = x + width * 0.2 + (i % 2) * width * 0.6;
          const glowY = y + (i * 0.2 + 0.1) * height;
          const glowSize = 3 + Math.sin(Date.now() / 300 + i) * 1;

          ctx.fillStyle = "rgba(64, 196, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(glowX, glowY, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw score
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(
          "Press Space to Start",
          canvas.width / 2 - 120,
          canvas.height / 2
        );
      }

      // Draw game over text
      if (gameOver && ctx) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(
          "Game Over!",
          canvas.width / 2 - 70,
          canvas.height / 2 - 30
        );
        ctx.fillText(
          `Score: ${score}`,
          canvas.width / 2 - 50,
          canvas.height / 2 + 10
        );
        ctx.font = "20px Arial";
        ctx.fillText(
          "Press Space to Restart",
          canvas.width / 2 - 90,
          canvas.height / 2 + 50
        );
      }

      return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center relative">
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={setCurrentTheme}
          />
          <h1 className="text-3xl font-bold mb-6">Flappy Bird</h1>
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="border border-gray-300 rounded-lg"
          />
          {!gameOver && gameStarted && <HighScoreSubmenu scores={scores} />}
          {gameOver && showLeaderboard && (
            <HighScoreSubmenu
              scores={scores}
              onSave={handleSaveScore}
              onClose={handleCloseLeaderboard}
            />
          )}
          <Leaderboard
            isOpen={showLeaderboard}
            currentScore={score}
            onClose={handleCloseLeaderboard}
            onSubmit={handleSaveScore}
            scores={scores}
          />
        </div>
      );
    };

    const gameLoop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleClick = () => {
      if (gameOver) {
        setShowLeaderboard(true);
        return;
      }
      if (!gameStarted) {
        setGameStarted(true);
      }
      gameState.current.birdVelocity = JUMP_FORCE;
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        handleClick();
      }
    };

    canvas.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyPress);
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    gameStarted,
    gameOver,
    score,
    currentTheme,
    setShowLeaderboard,
    setScore,
    handleSaveScore,
    scores,
    showLeaderboard,
  ]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center relative">
      <ThemeSelector
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      <h1 className="text-3xl font-bold mb-6">Flappy Bird</h1>
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="border border-gray-300 rounded-lg"
      />
      {!gameOver && gameStarted && <HighScoreSubmenu scores={scores} />}
      <Leaderboard
        isOpen={showLeaderboard}
        currentScore={score}
        onClose={handleCloseLeaderboard}
        onSubmit={handleSaveScore}
        scores={scores}
      />
    </div>
  );
}
