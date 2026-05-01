import { useState, useEffect } from "react";
import * as Papa from "papaparse";

const CYAN = "#21d6f1";
const CYAN_DARK = "#0ab8d4";
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQVeVOJMXznMHAux74HU0L_unfJCCrSUpyd-8PGAcwawMorq8mZ0Q-sQpR_BBufRskeri-0f5K-R_1/pub?output=csv";

const catColors = {
  Email: "#0ab8d4", Reuniao: "#7c5cbf", Briefing: "#e07b2a",
  Copywriting: "#2a9e6b", Pesquisa: "#d44a6f", Apresentacao: "#3a7bd5",
};

const categorias = ["Todos", "Email", "Reuniao", "Briefing", "Copywriting", "Pesquisa", "Apresentacao"];
const ferramentas = ["Todos", "Qualquer", "Claude", "ChatGPT", "Gemini"];

function Tag({ label }) {
  const color = catColors[label] || "#888";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color, border: "1px solid " + color + "44", borderRadius: 4, padding: "2px 8px", background: color + "11", whiteSpace: "nowrap" }}>{label}</span>
  );
}

function ToolTag({ label }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color: "#999", border: "1px solid #e5e5e5", borderRadius: 4, padding: "2px 8px", background: "#f9f9f9", whiteSpace: "nowrap" }}>{label}</span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: copied ? "#e8fafe" : CYAN, color: copied ? CYAN_DARK : "#fff", border: copied ? "1px solid #21d6f1" : "none", borderRadius: 8, padding: "11px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
      {copied ? "Copiado!" : "Copiar prompt"}
    </button>
  );
}

function PromptDetail({ prompt, onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13, padding: "28px 0 24px" }}>voltar</button>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <Tag label={prompt.categoria} /><ToolTag label={prompt.ferramenta} />
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 12 }}>{prompt.titulo}</h1>
      <p style={{ color: "#777", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{prompt.descricao}</p>
      <div style={{ background: "#d8f9fe", borderRadius: 10, padding: "28px 32px", marginBottom: 20, border: "1px solid #b8f0fc" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: CYAN_DARK, textTransform: "uppercase", marginBottom: 16 }}>Prompt</div>
        <pre style={{ fontFamily: "Courier, monospace", fontSize: 14, lineHeight: 1.9, color: "#111", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{prompt.prompt}</pre>
      </div>
      <CopyButton text={prompt.prompt} />
    </div>
  );
}

function PaywallCard() {
  return (
    <div style={{ background: "#f9fffe", border: "2px solid #21d6f144", borderRadius: 14, padding: "40px 28px", textAlign: "center", marginTop: 28 }}>
      <p style={{ color: "#111", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Prompt exclusivo para assinantes</p>
      <p style={{ color: "#999", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Acesse o repositorio completo por R$29/mes</p>
      <button style={{ background: "#21d6f1", color: "#fff", border: "none", borderRadius: 8, padding: "13px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Assinar agora</button>
    </div>
  );
}

function PromptCard({ prompt, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isFree = prompt.free === "sim";
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: "#fff", border: hovered ? "1px solid #21d6f188" : "1px solid #ebebeb", borderRadius: 12, padding: "20px", cursor: "pointer", boxShadow: hovered ? "0 4px 20px rgba(33,214,241,0.12)" : "0 1px 4px rgba(0,0,0,0.04)", transform: hovered ? "translateY(-2px)" : "none", transition: "all 0.18s", position: "relative" }}>
      {!isFree && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 11, background: "#f5f5f5", color: "#bbb", borderRadius: 4, padding: "3px 8px" }}>premium</div>}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <Tag label={prompt.categoria} /><ToolTag label={prompt.ferramenta} />
      </div>
      <h3 style={{ color: "#111", fontSize: 15, fontWeight: 700, lineHeight: 1.45, marginBottom: 8, paddingRight: isFree ? 0 : 60 }}>{prompt.titulo}</h3>
      <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6 }}>{prompt.descricao}</p>
      <div style={{ marginTop: 16, fontSize: 12, color: isFree ? CYAN_DARK : "#ccc", fontWeight: 700 }}>{isFree ? "Ver prompt" : "Desbloquear"}</div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? "#21d6f1" : "#fff", color: active ? "#fff" : "#777", border: active ? "1px solid #21d6f1" : "1px solid #e0e0e0", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>
  );
}

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");
  const [ferrFilter, setFerrFilter] = useState("Todos");

  useEffect(() => {
    fetch(SHEET_URL)
      .then(r => r.text())
      .then(csv => {
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setPrompts(result.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Nao foi possivel carregar os prompts.");
        setLoading(false);
      });
  }, []);

  const filtered = prompts.filter(p => {
    const matchSearch = (p.titulo || "").toLowerCase().includes(search.toLowerCase()) || (p.descricao || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || p.categoria === catFilter;
    const matchFerr = ferrFilter === "Todos" || p.ferramenta === ferrFilter;
    return matchSearch && matchCat && matchFerr;
  });

  const header = (
    <div style={{ background: "#fff", borderBottom: "1px solid #ebebeb", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 900, fontSize: 17, color: "#111" }}>Update<span style={{ color: "#21d6f1" }}>!</span><span style={{ color: "#bbb", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>Prompts</span></span>
      <button style={{ background: "#21d6f1", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Assinar R$29/mes</button>
    </div>
  );

  if (loading) return <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>{header}<div style={{ textAlign: "center", padding: "80px 0", color: "#aaa" }}>Carregando prompts...</div></div>;

  if (error) return <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>{header}<div style={{ maxWidth: 500, margin: "60px auto", padding: "0 24px" }}><div style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 10, padding: "24px", color: "#c00", fontSize: 14 }}>{error}</div></div></div>;

  if (selected !== null) {
    const prompt = prompts[selected];
    const isFree = prompt && prompt.free === "sim";
    return (
      <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
        {header}
        {isFree ? <PromptDetail prompt={prompt} onBack={() => setSelected(null)} /> : (
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13, padding: "28px 0 24px" }}>voltar</button>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><Tag label={prompt.categoria} /><ToolTag label={prompt.ferramenta} /></div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1.3, marginBottom: 12 }}>{prompt.titulo}</h1>
            <p style={{ color: "#777", fontSize: 15, lineHeight: 1.7 }}>{prompt.descricao}</p>
            <PaywallCard />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
      {header}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "36px 32px", marginBottom: 28, border: "1px solid #ebebeb" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: CYAN_DARK, textTransform: "uppercase", marginBottom: 10 }}>Update or Die Repositorio</p>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#111", lineHeight: 1.25, marginBottom: 10 }}>Prompts para usar hoje.<br /><span style={{ color: "#21d6f1" }}>Nao amanha. Agora.</span></h1>
          <p style={{ color: "#888", fontSize: 15, lineHeight: 1.65, maxWidth: 500 }}>Repositorio curado com prompts do dia a dia. Nada teorico. Tudo testado.</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar prompt..." style={{ width: "100%", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px", color: "#111", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }} />
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>{categorias.map(c => <FilterPill key={c} label={c} active={catFilter === c} onClick={() => setCatFilter(c)} />)}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{ferramentas.map(f => <FilterPill key={f} label={f} active={ferrFilter === f} onClick={() => setFerrFilter(f)} />)}</div>
        </div>
        <div style={{ color: "#bbb", fontSize: 11, letterSpacing: "0.08em", marginBottom: 20, marginTop: 16, textTransform: "uppercase" }}>{filtered.length} prompts encontrados</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {filtered.map((p, i) => <PromptCard key={i} prompt={p} onClick={() => setSelected(i)} />)}
        </div>
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: "60px 0", fontSize: 14 }}>Nenhum prompt encontrado.</div>}
      </div>
    </div>
  );
}
