import { useState, useEffect } from "react";
import * as Papa from "papaparse";

const CYAN = "#21d6f1";
const CYAN_DARK = "#0ab8d4";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURAÇÃO — troque pelo ID da sua planilha
// Como achar o ID: é a parte longa da URL da sua planilha
// Ex: docs.google.com/spreadsheets/d/ >>> ESTE_TRECHO_AQUI <<< /edit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SHEET_ID = "10nlnEVl2xObGw7V7dB_pQrDawCkvCMYAe5yJyXy48ww";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Colunas esperadas na planilha (linha 1 = cabeçalho):
// titulo | descricao | categoria | ferramenta | nivel | free | prompt

const catColors = {
  Email: "#0ab8d4",
  Reunião: "#7c5cbf",
  Briefing: "#e07b2a",
  Copywriting: "#2a9e6b",
  Pesquisa: "#d44a6f",
  Apresentação: "#3a7bd5",
};

const categorias = ["Todos", "Email", "Reunião", "Briefing", "Copywriting", "Pesquisa", "Apresentação"];
const ferramentas = ["Todos", "Qualquer", "Claude", "ChatGPT", "Gemini"];

function Tag({ label }) {
  const color = catColors[label] || "#888";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
      textTransform: "uppercase", color,
      border: `1px solid ${color}44`, borderRadius: 4,
      padding: "2px 8px", background: `${color}11`,
      whiteSpace: "nowrap", fontFamily: "Inter, sans-serif"
    }}>{label}</span>
  );
}

function ToolTag({ label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, letterSpacing: "0.05em",
      color: "#999", border: "1px solid #e5e5e5",
      borderRadius: 4, padding: "2px 8px", background: "#f9f9f9",
      whiteSpace: "nowrap", fontFamily: "Inter, sans-serif"
    }}>{label}</span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        background: copied ? "#e8fafe" : CYAN,
        color: copied ? CYAN_DARK : "#fff",
        border: copied ? `1px solid ${CYAN}` : "none",
        borderRadius: 8, padding: "11px 24px",
        fontWeight: 700, fontSize: 13, cursor: "pointer",
        letterSpacing: "0.04em", transition: "all 0.2s",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {copied ? "✓ Copiado!" : "Copiar prompt"}
    </button>
  );
}

function SetupScreen() {
  return (
    <div style={{
      maxWidth: 600, margin: "60px auto", padding: "0 24px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        background: "#fff8e1", border: "1px solid #ffe082",
        borderRadius: 12, padding: "28px 28px"
      }}>
        <p style={{ fontWeight: 800, fontSize: 16, color: "#111", marginBottom: 16 }}>
          ⚙️ Configure sua planilha Google Sheets
        </p>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          O app está pronto. Você só precisa conectar uma planilha. Siga os passos:
        </p>
        <ol style={{ color: "#555", fontSize: 13, lineHeight: 2, paddingLeft: 20, marginBottom: 20 }}>
          <li>Crie uma planilha no Google Sheets</li>
          <li>Na linha 1, crie as colunas: <code style={{ background: "#f0f0f0", padding: "1px 6px", borderRadius: 3 }}>titulo | descricao | categoria | ferramenta | nivel | free | prompt</code></li>
          <li>Preencha a partir da linha 2 com seus prompts</li>
          <li>No menu Arquivo → Compartilhar → Publicar na web → selecione CSV → Publicar</li>
          <li>Copie o ID da URL da planilha e substitua <code style={{ background: "#f0f0f0", padding: "1px 6px", borderRadius: 3 }}>SEU_SHEET_ID_AQUI</code> no código</li>
        </ol>
        <div style={{
          background: "#f5f5f5", borderRadius: 8,
          padding: "12px 16px", fontSize: 12,
          fontFamily: "Courier, monospace", color: "#555"
        }}>
          Na coluna <strong>free</strong>: escreva <strong>sim</strong> para prompt gratuito ou <strong>nao</strong> para premium
        </div>
      </div>
    </div>
  );
}

function PromptDetail({ prompt, onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 80px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#aaa",
        cursor: "pointer", fontSize: 13, padding: "28px 0 24px",
        display: "flex", alignItems: "center", gap: 6,
        letterSpacing: "0.04em", fontFamily: "Inter, sans-serif"
      }}>← voltar para prompts</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <Tag label={prompt.categoria} />
        <ToolTag label={prompt.ferramenta} />
        <ToolTag label={prompt.nivel} />
      </div>

      <h1 style={{
        fontSize: 26, fontWeight: 800, color: "#111",
        lineHeight: 1.3, marginBottom: 12, fontFamily: "Inter, sans-serif"
      }}>{prompt.titulo}</h1>

      <p style={{
        color: "#777", fontSize: 15, lineHeight: 1.7,
        marginBottom: 32, fontFamily: "Inter, sans-serif"
      }}>{prompt.descricao}</p>

      <div style={{
        background: "#d8f9fe", borderRadius: 10,
        padding: "28px 32px", marginBottom: 20,
        border: "1px solid #b8f0fc"
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          color: CYAN_DARK, textTransform: "uppercase",
          marginBottom: 16, fontFamily: "Inter, sans-serif"
        }}>Prompt</div>
        <pre style={{
          fontFamily: "Courier, 'Courier New', monospace",
          fontSize: 14, lineHeight: 1.9, color: "#111",
          whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0
        }}>{prompt.prompt}</pre>
      </div>

      <CopyButton text={prompt.prompt} />
    </div>
  );
}

function PaywallCard() {
  return (
    <div style={{
      background: "#f9fffe", border: `2px solid ${CYAN}44`,
      borderRadius: 14, padding: "40px 28px",
      textAlign: "center", marginTop: 28
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>🔒</div>
      <p style={{
        color: "#111", fontWeight: 800, fontSize: 20,
        marginBottom: 8, fontFamily: "Inter, sans-serif"
      }}>Prompt exclusivo para assinantes</p>
      <p style={{
        color: "#999", fontSize: 14, marginBottom: 28,
        lineHeight: 1.6, fontFamily: "Inter, sans-serif"
      }}>
        Acesse o repositório completo por <strong style={{ color: "#111" }}>R$29/mês</strong>
      </p>
      <button style={{
        background: CYAN, color: "#fff", border: "none",
        borderRadius: 8, padding: "13px 32px",
        fontWeight: 800, fontSize: 14, cursor: "pointer",
        letterSpacing: "0.04em", fontFamily: "Inter, sans-serif"
      }}>Assinar agora</button>
    </div>
  );
}

function PromptCard({ prompt, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isFree = prompt.free === "sim";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? CYAN + "88" : "#ebebeb"}`,
        borderRadius: 12, padding: "20px", cursor: "pointer",
        transition: "all 0.18s", position: "relative",
        boxShadow: hovered ? "0 4px 20px rgba(33,214,241,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none"
      }}
    >
      {!isFree && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          fontSize: 11, background: "#f5f5f5", color: "#bbb",
          borderRadius: 4, padding: "3px 8px", fontWeight: 600,
          letterSpacing: "0.05em", fontFamily: "Inter, sans-serif"
        }}>🔒 premium</div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <Tag label={prompt.categoria} />
        <ToolTag label={prompt.ferramenta} />
      </div>
      <h3 style={{
        color: "#111", fontSize: 15, fontWeight: 700,
        lineHeight: 1.45, marginBottom: 8,
        fontFamily: "Inter, sans-serif",
        paddingRight: isFree ? 0 : 60
      }}>{prompt.titulo}</h3>
      <p style={{
        color: "#999", fontSize: 13, lineHeight: 1.6,
        fontFamily: "Inter, sans-serif"
      }}>{prompt.descricao}</p>
      <div style={{
        marginTop: 16, fontSize: 12,
        color: isFree ? CYAN_DARK : "#ccc",
        fontWeight: 700, letterSpacing: "0.04em",
        fontFamily: "Inter, sans-serif"
      }}>
        {isFree ? "Ver prompt →" : "Desbloquear →"}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? CYAN : "#fff",
        color: active ? "#fff" : "#777",
        border: `1px solid ${active ? CYAN : "#e0e0e0"}`,
        borderRadius: 20, padding: "6px 14px",
        fontSize: 12, fontWeight: active ? 700 : 400,
        cursor: "pointer", letterSpacing: "0.03em",
        whiteSpace: "nowrap", transition: "all 0.15s",
        fontFamily: "Inter, sans-serif"
      }}
    >{label}</button>
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

  const isConfigured = SHEET_ID !== "SEU_SHEET_ID_AQUI";

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    fetch(SHEET_URL)
      .then(r => {
        if (!r.ok) throw new Error("Erro ao carregar planilha");
        return r.text();
      })
      .then(csv => {
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setPrompts(result.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Não foi possível carregar os prompts. Verifique se a planilha está publicada como CSV.");
        setLoading(false);
      });
  }, []);

  const filtered = prompts.filter(p => {
    const matchSearch =
      (p.titulo || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.descricao || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || p.categoria === catFilter;
    const matchFerr = ferrFilter === "Todos" || p.ferramenta === ferrFilter;
    return matchSearch && matchCat && matchFerr;
  });

  const header = (
    <div style={{
      background: "#fff", borderBottom: "1px solid #ebebeb",
      padding: "14px 24px", display: "flex",
      alignItems: "center", justifyContent: "space-between"
    }}>
      <span style={{
        fontWeight: 900, fontSize: 17, color: "#111",
        letterSpacing: "-0.02em", fontFamily: "Inter, sans-serif"
      }}>
        Update<span style={{ color: CYAN }}>!</span>
        <span style={{ color: "#bbb", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>Prompts</span>
      </span>
      <button style={{
        background: CYAN, color: "#fff", border: "none",
        borderRadius: 6, padding: "7px 16px",
        fontWeight: 700, fontSize: 12, cursor: "pointer",
        letterSpacing: "0.04em", fontFamily: "Inter, sans-serif"
      }}>Assinar — R$29/mês</button>
    </div>
  );

  if (!isConfigured) return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
      {header}
      <SetupScreen />
    </div>
  );

  if (loading) return (
    <div style={{
      background: "#f7f7f7", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", color: "#aaa", fontSize: 14
    }}>
      {header}
      <p>Carregando prompts...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
      {header}
      <div style={{
        maxWidth: 500, margin: "60px auto", padding: "0 24px",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          background: "#fff5f5", border: "1px solid #fcc",
          borderRadius: 10, padding: "24px", color: "#c00", fontSize: 14
        }}>⚠️ {error}</div>
      </div>
    </div>
  );

  if (selected) {
    const prompt = prompts.find((_, i) => i === selected);
    const isFree = prompt?.free === "sim";
    return (
      <div style={{ background: "#f7f7f7", minHeight: "100vh" }}>
        {header}
        {isFree
          ? <PromptDetail prompt={prompt} onBack={() => setSelected(null)} />
          : (
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none", color: "#aaa",
                cursor: "pointer", fontSize: 13, padding: "28px 0 24px",
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "Inter, sans-serif"
              }}>← voltar para prompts</button>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Tag label={prompt.categoria} />
                <ToolTag label={prompt.ferramenta} />
              </div>
              <h1 style={{
                fontSize: 26, fontWeight: 800, color: "#111",
                lineHeight: 1.3, marginBottom: 12, fontFamily: "Inter, sans-serif"
              }}>{prompt.titulo}</h1>
              <p style={{ color: "#777", fontSize: 15, lineHeight: 1.7, fontFamily: "Inter, sans-serif" }}>
                {prompt.descricao}
              </p>
              <PaywallCard />
            </div>
          )
        }
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f7f7", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {header}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "36px 20px" }}>

        {/* Hero */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "36px 32px",
          marginBottom: 28, border: "1px solid #ebebeb",
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            color: CYAN_DARK, textTransform: "uppercase", marginBottom: 10
          }}>Update or Die · Repositório</p>
          <h1 style={{
            fontSize: 30, fontWeight: 900, color: "#111", lineHeight: 1.25, marginBottom: 10
          }}>
            Prompts para usar hoje.<br />
            <span style={{ color: CYAN }}>Não amanhã. Agora.</span>
          </h1>
          <p style={{ color: "#888", fontSize: 15, lineHeight: 1.65, maxWidth: 500 }}>
            Repositório curado com prompts do dia a dia — e-mail, reunião, briefing, copy. Nada teórico. Tudo testado.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#bbb", fontSize: 16
          }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar prompt..."
            style={{
              width: "100%", background: "#fff",
              border: "1px solid #e0e0e0", borderRadius: 8,
              padding: "12px 16px 12px 40px", color: "#111",
              fontSize: 14, outline: "none", boxSizing: "border-box",
              fontFamily: "Inter, sans-serif", transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = CYAN}
            onBlur={e => e.target.style.borderColor = "#e0e0e0"}
          />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {categorias.map(c => (
              <FilterPill key={c} label={c} active={catFilter === c} onClick={() => setCatFilter(c)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ferramentas.map(f => (
              <FilterPill key={f} label={f} active={ferrFilter === f} onClick={() => setFerrFilter(f)} />
            ))}
          </div>
        </div>

        <div style={{
          color: "#bbb", fontSize: 11, letterSpacing: "0.08em",
          marginBottom: 20, textTransform: "uppercase", marginTop: 16
        }}>
          {filtered.length} prompts encontrados
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14
        }}>
          {filtered.map((p, i) => (
            <PromptCard key={i} prompt={p} onClick={() => setSelected(i)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", color: "#ccc",
            padding: "60px 0", fontSize: 14
          }}>Nenhum prompt encontrado.</div>
        )}
      </div>
    </div>
  );
}
