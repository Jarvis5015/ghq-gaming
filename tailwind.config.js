export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ghq: {
          bg: "#050810",
          surface: "#0a0f1e",
          card: "#0d1428",
          border: "#1a2545",
          accent: "#00f5ff",
          gold: "#ffd700",
          purple: "#7c3aed",
          red: "#ff2d55",
          green: "#00ff88",
          text: "#e8eaf6",
          muted: "#4a5568",
        }
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #00f5ff44, 0 0 20px #00f5ff22" },
          "100%": { boxShadow: "0 0 20px #00f5ff88, 0 0 60px #00f5ff44" },
        }
      }
    }
  },
  plugins: []
}
