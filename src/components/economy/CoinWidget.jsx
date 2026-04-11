import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useStore } from "../../store/useStore";
import { TrendingUp, Award, Star, Zap, Gift } from "lucide-react";

const achievements = [
  { id: 1, icon: "🏆", label: "First Win", coins: 500, earned: true },
  { id: 2, icon: "🎯", label: "10 Tournaments", coins: 1000, earned: true },
  { id: 3, icon: "⚡", label: "Win Streak x5", coins: 2000, earned: false },
  { id: 4, icon: "👑", label: "Top 10 Rank", coins: 3000, earned: false },
  { id: 5, icon: "💎", label: "Champions Finalist", coins: 5000, earned: false },
];

const coinRewards = [
  { event: "Join Tournament", coins: "+50", color: "text-ghq-cyan" },
  { event: "Win Match", coins: "+200", color: "text-ghq-green" },
  { event: "Top 3 Finish", coins: "+500", color: "text-ghq-gold" },
  { event: "Win Tournament", coins: "+1000", color: "text-ghq-gold" },
  { event: "Daily Login", coins: "+25", color: "text-ghq-cyan" },
];

export function CoinWidget() {
  const { user, earnCoins } = useStore();
  const [claimed, setClaimed] = useState(false);
  const [showPop, setShowPop] = useState(false);

  const handleDailyBonus = () => {
    if (!claimed) {
      earnCoins(25);
      setClaimed(true);
      setShowPop(true);
      setTimeout(() => setShowPop(false), 2000);
    }
  };

  return (
    <div className="relative bg-[#0a0a12] border border-[#1a1a2e] p-5">
      {/* Coin Pop */}
      <AnimatePresence>
        {showPop && (
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -60, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-8 font-display text-2xl text-ghq-gold z-10 pointer-events-none"
            style={{ textShadow: "0 0 20px #f5c842" }}
          >
            +25 ⬡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display tracking-widest text-sm text-ghq-muted">GHQ ECONOMY</h3>
        <span className="font-mono text-[10px] text-ghq-muted bg-white/5 px-2 py-0.5">v2.4</span>
      </div>

      {/* Balance */}
      <div className="text-center py-5 border border-[#1a1a2e] bg-[#050508] mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ghq-gold/5 to-transparent" />
        <p className="font-mono text-xs text-ghq-muted mb-1 tracking-widest">YOUR BALANCE</p>
        <motion.p
          key={user.coins}
          initial={{ scale: 1.1, color: "#00ff88" }}
          animate={{ scale: 1, color: "#f5c842" }}
          className="font-display text-4xl tracking-wide coin-icon"
        >
          {user.coins.toLocaleString()}
        </motion.p>
        <p className="font-mono text-xs text-ghq-muted mt-1">GHQ COINS</p>
      </div>

      {/* Daily bonus */}
      <button
        onClick={handleDailyBonus}
        disabled={claimed}
        className={`w-full py-2.5 mb-4 font-display tracking-widest text-xs border transition-all duration-300 ${
          claimed
            ? "border-white/10 text-ghq-muted cursor-not-allowed"
            : "border-ghq-gold/40 text-ghq-gold hover:bg-ghq-gold/10 hover:shadow-[0_0_15px_rgba(245,200,66,0.2)]"
        }`}
      >
        {claimed ? "✓ DAILY BONUS CLAIMED" : "⬡ CLAIM DAILY BONUS +25"}
      </button>

      {/* Reward table */}
      <div>
        <p className="font-mono text-[10px] text-ghq-muted tracking-widest mb-2">EARN COINS BY</p>
        <div className="space-y-1.5">
          {coinRewards.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/3 border border-white/5">
              <span className="font-body text-xs text-ghq-muted">{r.event}</span>
              <span className={`font-mono text-xs font-bold ${r.color}`}>{r.coins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AchievementsPanel() {
  return (
    <div className="bg-[#0a0a12] border border-[#1a1a2e] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={14} className="text-ghq-gold" />
        <h3 className="font-display tracking-widest text-sm text-ghq-muted">ACHIEVEMENTS</h3>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 px-3 py-2.5 border transition-all ${
              a.earned
                ? "border-ghq-gold/20 bg-ghq-gold/5"
                : "border-white/5 opacity-50 grayscale"
            }`}
          >
            <span className="text-xl">{a.icon}</span>
            <div className="flex-1">
              <p className={`font-body text-sm ${a.earned ? "text-ghq-text" : "text-ghq-muted"}`}>
                {a.label}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-ghq-gold text-sm">⬡</span>
              <span className={`font-mono text-xs ${a.earned ? "text-ghq-gold" : "text-ghq-muted"}`}>
                {a.coins.toLocaleString()}
              </span>
            </div>
            {a.earned && <span className="text-ghq-green text-xs">✓</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
