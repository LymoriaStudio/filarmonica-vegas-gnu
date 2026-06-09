

import React, { useState, useRef } from 'react';
import { Upload, X, Bold, Italic, Heading1, Heading2, List, Eye, Code, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { BRASS_IMAGES } from '../../data/initialData';

// Chart 1: Area Chart (Crescimento de Alunos / Doações)
interface AreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}
export function CustomAreaChart({ data, color = '#F2C94C', height = 180 }: AreaChartProps) {
  const max = Math.max(...data.map(d => d.value), 1) * 1.1;
  const padding = 30;
  const chartHeight = height - padding * 2;
  const width = 500;
  const chartWidth = width - padding * 2;

  // Generate SVG Points
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - (d.value / max) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full flex flex-col justify-between" id="area-chart">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * chartHeight;
            const gridVal = Math.round((max * (1 - ratio)));
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#2b2b2b" 
                  strokeDasharray="3,3" 
                />
                <text 
                  x={padding - 6} 
                  y={y + 4} 
                  fill="#888" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          {points.length > 0 && (
            <path d={areaD} fill="url(#areaGrad)" />
          )}

          {/* Trend Line */}
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Points & Interactive Tooltips */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? '6' : '4'}
                fill={color}
                stroke="#0A0A0A"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <text
                x={p.x}
                y={height - padding + 16}
                fill="#888"
                fontSize="9"
                textAnchor="middle"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute z-10 p-2 text-xs font-mono rounded bg-neutral-900 border border-neutral-700 text-white shadow-xl pointer-events-none"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-neutral-400 font-sans">{points[hoveredIndex].label}</div>
            <div className="font-bold text-amber-400 font-mono text-sm leading-none mt-1">
              {points[hoveredIndex].value.toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Chart 2: Double Bar Chart (Doações/Orçamento ou Eventos por Categoria)
interface BarChartProps {
  data: { label: string; v1: number; v2: number }[];
  v1Name?: string;
  v2Name?: string;
  color1?: string;
  color2?: string;
  height?: number;
}
export function CustomBarChart({ 
  data, 
  v1Name = 'Atual', 
  v2Name = 'Anterior', 
  color1 = '#0B4DA2', 
  color2 = '#F2C94C', 
  height = 180 
}: BarChartProps) {
  const maxVal = Math.max(...data.flatMap(d => [d.v1, d.v2]), 1) * 1.15;
  const padding = 30;
  const chartHeight = height - padding * 2;
  const width = 500;
  const chartWidth = width - padding * 2;
  const groupWidth = chartWidth / data.length;
  const barWidth = groupWidth * 0.35;

  const [hovered, setHovered] = useState<{ idx: number; type: 1 | 2 } | null>(null);

  return (
    <div className="w-full h-full flex flex-col justify-between" id="bar-chart">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * chartHeight;
            const gridVal = Math.round((maxVal * (1 - ratio)));
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#2b2b2b" 
                  strokeDasharray="3,3" 
                />
                <text 
                  x={padding - 6} 
                  y={y + 4} 
                  fill="#888" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  textAnchor="end"
                >
                  {gridVal >= 1000 ? `${(gridVal/1000).toFixed(1)}k` : gridVal}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const groupX = padding + i * groupWidth;
            const x1 = groupX + groupWidth * 0.12;
            const x2 = x1 + barWidth + groupWidth * 0.06;

            const h1 = (d.v1 / maxVal) * chartHeight;
            const h2 = (d.v2 / maxVal) * chartHeight;
            const y1 = height - padding - h1;
            const y2 = height - padding - h2;

            return (
              <g key={i}>
                {/* Bar 1 */}
                <rect
                  x={x1}
                  y={y1}
                  width={barWidth}
                  height={Math.max(h1, 1)}
                  fill={color1}
                  rx="3"
                  className="cursor-pointer transition-all duration-150 opacity-90 hover:opacity-100"
                  onMouseEnter={() => setHovered({ idx: i, type: 1 })}
                  onMouseLeave={() => setHovered(null)}
                />
                {/* Bar 2 */}
                <rect
                  x={x2}
                  y={y2}
                  width={barWidth}
                  height={Math.max(h2, 1)}
                  fill={color2}
                  rx="3"
                  className="cursor-pointer transition-all duration-150 opacity-90 hover:opacity-100"
                  onMouseEnter={() => setHovered({ idx: i, type: 2 })}
                  onMouseLeave={() => setHovered(null)}
                />

                {/* X axis labels */}
                <text
                  x={groupX + groupWidth / 2}
                  y={height - padding + 16}
                  fill="#888"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-2 flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color1 }} />
            <span className="text-neutral-400">{v1Name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color2 }} />
            <span className="text-neutral-400">{v2Name}</span>
          </div>
        </div>

        {/* Interactive Tooltip */}
        {hovered !== null && data[hovered.idx] && (
          <div 
            className="absolute z-10 p-2 text-xs font-mono rounded bg-neutral-900 border border-neutral-700 text-white shadow-xl pointer-events-none"
            style={{
              left: `${((padding + hovered.idx * groupWidth + groupWidth/2) / width) * 100}%`,
              top: '15%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-neutral-400 font-sans">{data[hovered.idx].label}</div>
            <div className="font-bold font-mono text-sm mt-1 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hovered.type === 1 ? color1 : color2 }} />
              <span>
                {hovered.type === 1 ? v1Name : v2Name}: R$ { (hovered.type === 1 ? data[hovered.idx].v1 : data[hovered.idx].v2).toLocaleString('pt-BR') }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ==========================================
// 2. WORDPRESS-STYLE ADVANCED NEWS EDITOR
// ==========================================
interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}
export function RichTextEditor({ value, onChange, placeholder = 'Escreva o miolo da notícia aqui...' }: RichTextEditorProps) {
  const [tab, setTab] = useState<'visual' | 'code'>('visual');
  const textboxRef = useRef<HTMLTextAreaElement>(null);

  // Insert basic tag mockup at current cursor position
  const insertTag = (tagOpen: string, tagClose: string) => {
    const textarea = textboxRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const originalText = textarea.value;
    const selectedText = originalText.substring(start, end);
    const replacement = tagOpen + (selectedText || 'texto') + tagClose;

    const newValue = originalText.substring(0, start) + replacement + originalText.substring(end);
    onChange(newValue);

    // Re-focus & place cursor inside or after tags
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selectedText || 'texto').length);
    }, 50);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden flex flex-col min-h-[300px]">
      {/* Editor toolbar */}
      <div className="bg-neutral-950 px-3 py-2 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
          <button
            type="button"
            title="Negrito"
            onClick={() => insertTag('<strong>', '</strong>')}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center"
          >
            <Bold size={13} className="mr-1" /> Negrito
          </button>
          <button
            type="button"
            title="Itálico"
            onClick={() => insertTag('<em>', '</em>')}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center"
          >
            <Italic size={13} className="mr-1" /> Itálico
          </button>
          <button
            type="button"
            title="Cabeçalho H2"
            onClick={() => insertTag('<h2>', '</h2>')}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center"
          >
            <Heading1 size={13} className="mr-1" /> H2
          </button>
          <button
            type="button"
            title="Subtítulo H3"
            onClick={() => insertTag('<h3>', '</h3>')}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center"
          >
            <Heading2 size={13} className="mr-1" /> H3
          </button>
          <button
            type="button"
            title="Lista Com Marcadores"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            className="p-1 px-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs flex items-center"
          >
            <List size={13} className="mr-1" /> Lista
          </button>
        </div>

        {/* Tabs visual vs raw html */}
        <div className="flex space-x-1 bg-neutral-900 p-0.5 rounded border border-neutral-800">
          <button
            type="button"
            onClick={() => setTab('visual')}
            className={`p-1 px-2.5 rounded text-xs transition-all flex items-center ${tab === 'visual' ? 'bg-[#0B4DA2] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
          >
            <Eye size={12} className="mr-1" /> Visual
          </button>
          <button
            type="button"
            onClick={() => setTab('code')}
            className={`p-1 px-2.5 rounded text-xs transition-all flex items-center ${tab === 'code' ? 'bg-[#0B4DA2] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
          >
            <Code size={12} className="mr-1" /> Código HTML
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col">
        {tab === 'code' ? (
          <textarea
            ref={textboxRef}
            className="flex-1 w-full p-4 bg-neutral-900 text-neutral-100 font-mono text-sm focus:outline-none min-h-[220px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-[220px]">
            {/* Input Side */}
            <textarea
              ref={textboxRef}
              className="w-full md:w-1/2 p-4 bg-neutral-900 text-neutral-200 border-r border-neutral-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#0B4DA2]"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Digite o texto aqui. Use os botões acima para formatar rapidamente em HTML..."
            />
            {/* Visual Real-time Render Side */}
            <div className="w-full md:w-1/2 p-4 bg-neutral-950 text-neutral-300 text-xs overflow-y-auto max-h-[240px]">
              <div className="text-[10px] text-amber-500 font-mono tracking-wider mb-2 uppercase select-none">Pré-Visualização do Artigo</div>
              <div 
                className="prose prose-invert max-w-none text-neutral-200" 
                dangerouslySetInnerHTML={{ __html: value || `<p className="text-neutral-500 italic">Nada para visualizar ainda.</p>` }} 
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-neutral-950 px-3 py-1 text-[10px] text-neutral-500 border-t border-neutral-800 flex justify-between font-mono">
        <span>Pronto para publicação orquestral</span>
        <span>{value.length} Caracteres</span>
      </div>
    </div>
  );
}


// ==========================================
// 3. SECURE HTML5 DRAG & DROP MULTI-FILE UPLOAD
// ==========================================
interface ImageUploaderProps {
  onUploadSuccess: (fileUrl: string, fileName: string, fileType: 'image' | 'pdf' | 'video' | 'doc', size: string) => void;
  allowedTypes?: string;
  maxSizeMB?: number;
}
export function ImageUploader({ 
  onUploadSuccess, 
  allowedTypes = 'Imagens (.jpg, .png), PDFs, Vídeo e Doc', 
  maxSizeMB = 10 
}: ImageUploaderProps) {
  const [isDrag, setIsDrag] = useState(false);
  const [prog, setProg] = useState<number | null>(null);
  const [simFilename, setSimFilename] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (name: string, ext: string) => {
    setSimFilename(name);
    setProg(15);
    
    const interval = setInterval(() => {
      setProg((prev) => {
        if (prev === null) return 15;
        if (prev >= 100) {
          clearInterval(interval);
          
          let fileType: 'image' | 'pdf' | 'video' | 'doc' = 'doc';
          let finalUrl = BRASS_IMAGES.trumpet; // default fallback

          const extLower = ext.toLowerCase();
          if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extLower)) {
            fileType = 'image';
            // Pick a deterministic Unsplash URL for realistic premium view
            if (name.includes('trompete') || name.includes('bocal')) finalUrl = BRASS_IMAGES.trumpet;
            else if (name.includes('trombone') || name.includes('vara')) finalUrl = BRASS_IMAGES.trombone;
            else if (name.includes('trompa')) finalUrl = BRASS_IMAGES.frenchHorn;
            else if (name.includes('tuba') || name.includes('grave')) finalUrl = BRASS_IMAGES.tuba;
            else finalUrl = BRASS_IMAGES.heroBanner1;
          } else if (extLower === 'pdf') {
            fileType = 'pdf';
            finalUrl = '#pdf-doc';
          } else if (['mp4', 'mov', 'webm'].includes(extLower)) {
            fileType = 'video';
            finalUrl = '#video-clip';
          }

          const sizeStr = `${(1 + Math.random() * maxSizeMB).toFixed(1)} MB`;
          onUploadSuccess(finalUrl, name, fileType, sizeStr);
          
          setTimeout(() => {
            setProg(null);
            setSimFilename('');
          }, 800);

          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const parts = file.name.split('.');
      const ext = parts.pop() || '';
      simulateUpload(file.name, ext);
    }
  };

  const handSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const parts = file.name.split('.');
      const ext = parts.pop() || '';
      simulateUpload(file.name, ext);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
        isDrag 
          ? 'border-[#F2C94C] bg-amber-500/5' 
          : 'border-neutral-700 hover:border-[#0B4DA2] bg-neutral-900/50 hover:bg-neutral-900'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={handDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        onChange={handSelect} 
      />

      {prog === null ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-neutral-800 rounded-full text-amber-500 hover:scale-105 transition-all">
            <Upload size={24} />
          </div>
          <div className="text-sm font-medium text-neutral-200">
            Arraste arquivos de mídia para cá ou <span className="text-amber-400 font-bold underline">navegue</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">
            Formatos suportados: {allowedTypes} • Max {maxSizeMB}MB por arquivo
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <FileText size={28} className="text-[#0B4DA2] animate-bounce" />
          <div className="text-xs font-mono text-neutral-300">
            Fazendo upload de <span className="text-amber-400 font-bold">{simFilename}</span>
          </div>
          {/* Progress bar */}
          <div className="w-48 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#F2C94C] h-full transition-all duration-150" 
              style={{ width: `${prog}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{prog}% concluído</span>
        </div>
      )}
    </div>
  );
}


// ==========================================
// 4. ACTION TOAST & MOCK AUDIT EMITTER
// ==========================================
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}
export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-3 p-3 px-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white shadow-2xl animate-fade-in">
      {type === 'success' && <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />}
      {type === 'error' && <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />}
      {type === 'info' && <AlertCircle size={18} className="text-sky-400 flex-shrink-0" />}
      
      <span className="text-xs font-sans font-medium text-neutral-200">{message}</span>
      
      <button 
        type="button" 
        onClick={onClose} 
        className="text-neutral-500 hover:text-white transition-all pl-2 border-l border-neutral-800"
      >
        <X size={14} />
      </button>
    </div>
  );
}
