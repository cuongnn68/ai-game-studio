import React from "react";

export type Theme = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type ThemeSelectorProps = {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
};

const themes: Theme[] = [
  {
    id: "ufo",
    name: "UFO",
    description: "Classic UFO with pulsing lights",
    color: "#C0C0C0",
  },
  {
    id: "rocket",
    name: "Rocket",
    description: "Sleek rocket with flame trails",
    color: "#FF4500",
  },
  {
    id: "butterfly",
    name: "Butterfly",
    description: "Graceful butterfly with fluttering wings",
    color: "#9370DB",
  },
  {
    id: "dragon",
    name: "Dragon",
    description: "Fierce dragon with fire breath",
    color: "#8B0000",
  },
  {
    id: "ghost",
    name: "Ghost",
    description: "Spooky ghost with transparency effects",
    color: "#E6E6FA",
  },
  {
    id: "paperplane",
    name: "Paper Plane",
    description: "Origami plane with folded wings",
    color: "#F0F8FF",
  },
  {
    id: "balloon",
    name: "Balloon",
    description: "Colorful balloon that expands and contracts",
    color: "#FF69B4",
  },
  {
    id: "robot",
    name: "Robot",
    description: "Mechanical robot with blinking lights",
    color: "#4682B4",
  },
];

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-r-lg p-1 z-[100] transition-all duration-300 hover:w-auto w-12 overflow-hidden group">
      <div className="flex flex-col gap-1 min-w-[200px]">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`
              flex items-center gap-2 p-2 rounded-lg transition-all w-full
              ${
                currentTheme === theme.id
                  ? "bg-white/20"
                  : "bg-white/5 hover:bg-white/10"
              }
            `}
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            />
            <div className="text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-white text-sm font-medium whitespace-nowrap">
                {theme.name}
              </div>
              <div className="text-white/60 text-xs whitespace-nowrap">
                {theme.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
