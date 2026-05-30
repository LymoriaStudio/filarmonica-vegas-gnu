import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 100, prefix: "+", suffix: "", label: "Músicos ativos", desc: "Talentos que integram a orquestra desde 2022." },
  { value: 2, prefix: "+", suffix: " Anos", label: "Em atividade", desc: "Crescendo em qualidade e abrangência." },
  { value: 50, prefix: "+", suffix: "", label: "Apresentações", desc: "Concertos realizados em todo o estado." },
  { value: 100, prefix: "", suffix: "%", label: "Projeto social", desc: "Todos os alunos participam gratuitamente." },
];

function CountUp({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = Math.ceil(target / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section id="sobre" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Nossa história
          </span>
          <h2
            className="text-[#001856] mt-2"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.2,
            }}
          >
            Música que transforma
          </h2>
          <p
            className="text-gray-500 mt-4 max-w-2xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.05rem", lineHeight: 1.7 }}
          >
            A Filarmônica de Metais é um projeto social dedicado a democratizar o acesso à música erudita,
            formando músicos completos e cidadãos conscientes por meio da prática coletiva de instrumentos de metal.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-8 md:p-10 flex flex-col items-center text-center ${
                i % 2 === 0 ? "bg-[#ffc300]" : "bg-[#001856]"
              }`}
            >
              <div
                className={`mb-2 ${i % 2 === 0 ? "text-[#001856]" : "text-[#ffc300]"}`}
                style={{
                  fontFamily: "'Instrument Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
                  lineHeight: 1,
                }}
              >
                <CountUp target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <div
                className={`mb-2 ${i % 2 === 0 ? "text-[#001856]" : "text-white"}`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
              >
                {stat.label}
              </div>
              <p
                className={`text-sm ${i % 2 === 0 ? "text-[#001856]/70" : "text-white/70"}`}
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}
              >
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
