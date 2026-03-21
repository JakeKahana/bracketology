"use client";
import { useState, useRef, useCallback } from "react";

const ROUND_NAMES = ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals", "Final"];
const SUGGESTIONS = [
  "Dog Breeds", "Pasta Types", "Countries to Visit", "90s TV Shows",
  "Pizza Toppings", "Board Games", "Cheeses", "Superhero Movies",
  "Types of Tea", "Olympic Sports", "Ice Cream Flavors", "Rock Bands",
];
const RANDOM_TOPICS = [
  "Ice Cream Flavors", "World Cuisines", "Animated Movies", "Musical Instruments",
  "Olympic Sports", "Classic Video Games", "Cocktails", "Hiking Destinations",
  "Coffee Drinks", "Rock Bands", "Mythological Creatures", "Card Games",
  "Car Brands", "Classic Novels", "Dinosaurs", "Hot Sauces", "Street Foods",
  "Types of Tea", "Jazz Musicians", "Shakespeare Plays",
];

const C = {
  bg: "#0c0c0e", surface: "#141418", surface2: "#1c1c22", surface3: "#23232d",
  border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.13)",
  gold: "#e8b84b", green: "#3ec878", text: "#eeeae4",
  muted: "rgba(238,234,228,0.45)", hint: "rgba(238,234,228,0.2)",
};

function initRounds(items) {
  const r0 = [];
  for (let i = 0; i < 32; i += 2) r0.push({ a: items[i], b: items[i + 1], winner: null });
  const rounds = [r0];
  for (let r = 1; r <= 4; r++) {
    const n = Math.pow(2, 4 - r);
    rounds.push(Array.from({ length: n }, () => ({ a: null, b: null, winner: null })));
  }
  return rounds;
}

export default function Home() {
  const [inputVal, setInputVal] = useState("");
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [champion, setChampion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const bracketRef = useRef(null);

  const generate = useCallback(async (topicOverride) => {
    const t = topicOverride || inputVal.trim();
    if (!t) return;
    setError(null);
    setLoading(true);
    setRounds(null);
    setChampion(null);
    setCurrentRound(0);
    if (topicOverride) setInputVal(topicOverride);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setTopic(t);
      setRounds(initRounds(data.items));
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [inputVal]);

  const pickWinner = useCallback((r, m, side) => {
    setRounds((prev) => {
      const next = prev.map((rd) => rd.map((match) => ({ ...match })));
      const match = next[r][m];
      if (match.winner) return prev;
      const winner = side === "a" ? match.a : match.b;
      match.winner = winner;
      if (r + 1 < next.length) {
        next[r + 1][Math.floor(m / 2)][m % 2 === 0 ? "a" : "b"] = winner;
      }
      if (next[r].every((x) => x.winner) && r + 1 < next.length) setCurrentRound(r + 1);
      if (r === 4) setChampion(winner);
      clearTimeout(toastTimer.current);
      const msg = r === 4 ? `🏆 Champion: ${winner}` : `✓ ${winner} → ${ROUND_NAMES[r + 1]}`;
      setToast(msg);
      toastTimer.current = setTimeout(() => setToast(null), 2800);
      return next;
    });
  }, []);

  const clearBracket = () => {
    setTopic(""); setInputVal(""); setRounds(null);
    setChampion(null); setCurrentRound(0); setError(null);
  };

  const randomTopic = () => {
    const t = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    generate(t);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Barlow', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(12,12,14,0.95)", borderBottom: `1px solid ${C.border}`,
        padding: "0 24px", display: "flex", alignItems: "center", gap: 14, height: 58, flexWrap: "wrap",
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: 2, color: C.text, flexShrink: 0 }}>
          BRACKET<span style={{ color: C.gold }}>OLOGY</span>
        </div>
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Dog Breeds, Pasta Types, 90s Movies…"
          style={{
            flex: 1, minWidth: 160, maxWidth: 300,
            background: C.surface2, border: `1px solid ${C.border2}`,
            borderRadius: 6, color: C.text, fontFamily: "inherit",
            fontSize: 14, padding: "7px 12px", outline: "none",
          }}
        />
        <Btn onClick={() => generate()} gold disabled={loading}>Generate</Btn>
        <Btn onClick={randomTopic} disabled={loading}>🎲 Random</Btn>
        {rounds && <Btn onClick={clearBracket} ghost>Clear</Btn>}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ margin: "12px 24px 0", background: "rgba(220,80,60,0.12)", border: "1px solid rgba(220,80,60,0.25)", borderRadius: 6, padding: "9px 14px", fontSize: 13, color: "#f08070" }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Round banner ── */}
      {rounds && !loading && (
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "9px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>
            {ROUND_NAMES[currentRound]}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {champion ? `${topic} — Complete!` : `${rounds[currentRound].filter((m) => m.winner).length}/${rounds[currentRound].length} decided · ${topic}`}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {ROUND_NAMES.map((_, i) => (
              <div key={i} style={{ width: 26, height: 4, borderRadius: 2, background: i < currentRound ? C.green : i === currentRound ? C.gold : C.border2 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!rounds && !loading && (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>
            Build Your Bracket
          </div>
          <div style={{ fontSize: 15, color: C.hint, marginBottom: 28 }}>
            Enter any topic and hit Generate — 32 contenders get seeded, you pick the winners.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => generate(s)}
                style={{ background: C.surface2, border: `1px solid ${C.border2}`, borderRadius: 99, color: C.muted, fontSize: 13, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ padding: "80px 24px", textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, margin: "0 auto 16px", borderRadius: "50%",
            border: `3px solid ${C.border2}`, borderTopColor: C.gold,
            animation: "spin 0.75s linear infinite",
          }} />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, color: C.muted, letterSpacing: 1 }}>
            Building {inputVal} bracket…
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Champion ── */}
      {champion && (
        <div style={{ padding: "0 24px 20px" }}>
          <div style={{ background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)", borderRadius: 10, padding: "20px 24px", textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold, opacity: 0.7, marginBottom: 4 }}>🏆 CHAMPION</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>{champion}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Best {topic}</div>
          </div>
        </div>
      )}

      {/* ── Bracket ── */}
      {rounds && !loading && (
        <div ref={bracketRef} style={{ padding: "20px 24px 48px", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "stretch", minWidth: "max-content" }}>
            {rounds.map((matches, r) => (
              <div key={r} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, color: C.hint, textAlign: "center", paddingBottom: 12, minWidth: 156, textTransform: "uppercase" }}>
                  {ROUND_NAMES[r]}
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  {matches.map((match, m) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "4px 0", minHeight: 76 * Math.pow(2, r), position: "relative" }}>
                      {r < 4 && <div style={{ position: "absolute", right: 0, top: "50%", width: 14, height: 1, background: C.border2 }} />}
                      {matches.length > 1 && r < 4 && (
                        <div style={{ position: "absolute", right: 0, top: m % 2 === 0 ? "50%" : 0, bottom: m % 2 === 0 ? 0 : "50%", width: 1, background: C.border2 }} />
                      )}
                      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, overflow: "hidden", width: 142, flexShrink: 0 }}>
                        {[["a", match.a], ["b", match.b]].map(([side, name]) => {
                          const isWinner = match.winner && match.winner === name;
                          const isLoser = match.winner && match.winner !== name;
                          const canClick = name && !match.winner;
                          return (
                            <TeamRow
                              key={side}
                              name={name}
                              isWinner={isWinner}
                              isLoser={isLoser}
                              canClick={canClick}
                              isLast={side === "b"}
                              onClick={() => canClick && pickWinner(r, m, side)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: C.surface3, border: `1px solid ${C.border2}`, borderRadius: 7,
          padding: "9px 16px", fontSize: 13, color: C.text, zIndex: 200,
          whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function TeamRow({ name, isWinner, isLoser, canClick, isLast, onClick }) {
  const [hovered, setHovered] = useState(false);
  const bg = isWinner ? "rgba(62,200,120,0.1)" : hovered && canClick ? C.surface2 : "transparent";
  const color = isWinner ? C.green : isLoser ? C.hint : !name ? C.hint : C.text;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 10px", borderBottom: !isLast ? `1px solid ${C.border}` : "none",
        background: bg, cursor: canClick ? "pointer" : "default",
        transition: "background 0.1s", minHeight: 36, display: "flex", alignItems: "center",
      }}
    >
      <span style={{
        fontSize: 12, color, fontWeight: isWinner ? 500 : 400,
        fontStyle: !name ? "italic" : "normal",
        textDecoration: isLoser ? "line-through" : "none",
        lineHeight: 1.3,
      }}>
        {name || "TBD"}
      </span>
    </div>
  );
}

function Btn({ children, onClick, gold, ghost, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "7px 16px",
        borderRadius: 6,
        border: `1px solid ${gold ? C.gold : ghost ? "transparent" : C.border2}`,
        background: gold ? C.gold : hovered && !disabled ? C.surface2 : "transparent",
        color: gold ? "#0c0c0e" : ghost ? C.muted : C.text,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1, whiteSpace: "nowrap", transition: "all 0.1s",
      }}
    >
      {children}
    </button>
  );
}
