import { useState, useRef } from "react";
import { Plus, Trash2, Pencil, Save, X, Upload, Music } from "lucide-react";
import { instruments as initialInstruments, type Instrument as InstrumentItem } from "../../data/instruments";

// ─── Helpers ────────────────────────────────────────────────────────────────────

const INPUT = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#001856] focus:ring-1 focus:ring-[#001856]";
const LABEL = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider";
const BTN_PRIMARY = "flex items-center gap-2 bg-[#001856] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002070] transition-colors";
const BTN_GOLD = "flex items-center gap-2 bg-[#ffc300] text-[#001856] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors";
const BTN_GHOST = "flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors";

function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const cls = INPUT + (rows ? " resize-none" : "");
  return (
    <div>
      {label && <label className={LABEL}>{label}</label>}
      {rows ? (
        <textarea className={cls} value={value} onChange={e => onChange(e.target.value)} rows={rows} />
      ) : (
        <input className={INPUT} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

function ImageUpload({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div>
      {label && <label className={LABEL}>{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#001856] hover:bg-blue-50/30 transition-colors"
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="w-full max-h-40 object-cover rounded-lg" />
            <span className="text-xs text-gray-400 mt-1">Clique para trocar a imagem</span>
          </>
        ) : (
          <>
            <Upload size={22} className="text-gray-300" />
            <span className="text-sm text-gray-400 font-medium">Clique para enviar uma imagem</span>
            <span className="text-xs text-gray-300">JPG, PNG, WEBP</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-100 rounded-xl shadow-sm ${className}`}>{children}</div>;
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function InstrumentosERP() {
  const [items, setItems] = useState<InstrumentItem[]>(initialInstruments);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<InstrumentItem>>({});

  const openEdit = (inst: InstrumentItem, i: number) => { setEditIdx(i); setForm({ ...inst }); };
  const openNew = () => {
    setEditIdx(-1);
    setForm({ slug: "", name: "", description: "", longDescription: "", image: "", gallery: ["", "", ""], videoUrl: "", color: "#ffc300" });
  };
  const save = () => {
    const item = { ...form, slug: (form.slug || form.name || "").toLowerCase().replace(/\s+/g, "-") } as InstrumentItem;
    const next = editIdx === -1 ? [...items, item] : items.map((inst, i) => i === editIdx ? { ...inst, ...item } : inst);
    setItems(next); setEditIdx(null); setForm({});
  };
  const remove = (i: number) => { const next = items.filter((_, idx) => idx !== i); setItems(next); };
  const setGallery = (idx: number, v: string) => setForm(f => { const g = [...(f.gallery ?? ["", "", ""])]; g[idx] = v; return { ...f, gallery: g }; });

  return (
    <div className="p-8 space-y-6 min-h-screen">

      {/* Header */}
      <div className="bg-[#001856] rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ffc300] flex items-center justify-center">
            <Music size={20} className="text-[#001856]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              Instrumentos
            </h1>
            <p className="text-white/60 text-xs">Gerencie os instrumentos exibidos no site</p>
          </div>
        </div>
        <button onClick={openNew} className={BTN_GOLD}>
          <Plus size={16} /> Novo instrumento
        </button>
      </div>

      {/* Formulário edição */}
      {editIdx !== null && (
        <Card className="p-6">
          <h3 className="font-bold text-[#001856] text-base mb-5">
            {editIdx === -1 ? "Novo instrumento" : "Editar instrumento"}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nome"
                value={form.name ?? ""}
                onChange={v => setForm(f => ({ ...f, name: v }))}
              />
              <div>
                <label className={LABEL}>Cor de destaque</label>
                <div className="flex gap-2 mt-1">
                  {["#ffc300", "#001856"].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? "#000" : "transparent" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Field
              label="Descrição curta (carrossel)"
              value={form.description ?? ""}
              onChange={v => setForm(f => ({ ...f, description: v }))}
              rows={2}
            />
            <Field
              label="Descrição completa (página de detalhes)"
              value={form.longDescription ?? ""}
              onChange={v => setForm(f => ({ ...f, longDescription: v }))}
              rows={5}
            />

            <ImageUpload
              label="Imagem principal"
              value={form.image ?? ""}
              onChange={v => setForm(f => ({ ...f, image: v }))}
            />

            <div>
              <label className={LABEL}>Galeria de fotos (3 imagens — seção "Músicos em ação")</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {[0, 1, 2].map(i => (
                  <ImageUpload
                    key={i}
                    label={`Foto ${i + 1}`}
                    value={(form.gallery ?? ["", "", ""])[i] ?? ""}
                    onChange={v => setGallery(i, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL}>Vídeo de demonstração (URL embed do YouTube)</label>
              <Field
                label=""
                value={form.videoUrl ?? ""}
                onChange={v => setForm(f => ({ ...f, videoUrl: v }))}
              />
              <p className="text-xs text-gray-400 mt-1">
                Exemplo: https://www.youtube.com/embed/XXXXXXXXXXX
              </p>
              {form.videoUrl && (
                <div className="aspect-video mt-2 rounded-lg overflow-hidden bg-black">
                  <iframe src={form.videoUrl} className="w-full h-full" allowFullScreen title="preview" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="button" onClick={save} className={BTN_PRIMARY}>
              <Save size={15} /> Salvar
            </button>
            <button type="button" onClick={() => { setEditIdx(null); setForm({}); }} className={BTN_GHOST}>
              <X size={15} /> Cancelar
            </button>
          </div>
        </Card>
      )}

      {/* Lista de instrumentos */}
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <Card className="p-10 text-center">
            <Music size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Nenhum instrumento cadastrado.</p>
            <button type="button" onClick={openNew} className="mt-3 text-[#001856] text-sm font-semibold hover:underline">
              Adicionar o primeiro instrumento
            </button>
          </Card>
        )}
        {items.map((inst, i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
              {inst.image
                ? <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />
                : <Music size={20} className="text-gray-300" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#001856] text-sm">{inst.name}</p>
              <p className="text-xs text-gray-400 truncate">{inst.description}</p>
            </div>
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: inst.color }}
            />
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => openEdit(inst, i)}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
