import { useState } from "react";
import { Send, Phone, Mail, MapPin, CheckCircle, Heart, Building2, QrCode, ArrowLeft } from "lucide-react";
const interesseImage = "https://images.unsplash.com/photo-1709145234621-30c08c457fb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400";
const apoioImage = "https://images.unsplash.com/photo-1763627516727-2ca3e324fa59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400";

type Tab = "interesse" | "apoio" | "doacao";

const donationOptions = [
  { value: 100, label: "R$ 100" },
  { value: 500, label: "R$ 500" },
  { value: 1000, label: "R$ 1.000" },
  { value: 0, label: "A definir" },
];

const buildPixPayload = (amount: number) => {
  const base = `Doacao Filarmonica de Metais${amount ? ` - R$ ${amount.toFixed(2)}` : " - Valor a combinar"}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(base)}`;
};

export function Contact() {
  const [tab, setTab] = useState<Tab>("interesse");
  const [sent, setSent] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [interesseForm, setInteresseForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    instrumento: "",
    mensagem: "",
  });
  const [apoioForm, setApoioForm] = useState({
    empresa: "",
    responsavel: "",
    email: "",
    telefone: "",
    tipo: "",
    mensagem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const setter = tab === "interesse" ? setInteresseForm : setApoioForm;
    setter((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setSent(false);
    setDonationAmount(null);
    setShowQr(false);
  };


  return (
    <section id="contato" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="text-[#ffc300] uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            Entre em contato
          </span>
          <h2
            className="text-[#001856] mt-2"
            style={{
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              lineHeight: 1.2,
            }}
          >
            Faça parte da nossa história
          </h2>
          <p
            className="text-gray-500 mt-3 max-w-xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
          >
            Seja para se tornar músico, patrocinador ou parceiro — estamos prontos para te atender.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left: image + info */}
          <div className="flex flex-col gap-8">
            <div className="rounded-2xl overflow-hidden h-64 lg:h-auto flex-1 relative">
              <img
                key={tab}
                src={tab === "interesse" ? interesseImage : apoioImage}
                alt={tab === "interesse" ? "Crianças tocando instrumentos de metal" : "Concerto da filarmônica"}
                className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-[#001856]/80 backdrop-blur-sm rounded-xl px-4 py-3">
                <p
                  className="text-white"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
                >
                  {tab === "interesse"
                    ? "Inspire o talento musical das próximas gerações"
                    : "Patrocine concertos que transformam vidas"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: <Phone size={22} />,
                  label: "Telefone",
                  value: "(19) 99845-3478",
                },
                {
                  icon: <Mail size={22} />,
                  label: "E-mail",
                  value: "filarmonicademetais@gmail.com",
                },
                {
                  icon: <MapPin size={22} />,
                  label: "Endereço",
                  value: "R. Padre Avelino Canaza, 258 – Vila Galo, Americana – SP",
                },
              ].map((info, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className="text-[#ffc300]">{info.icon}</div>
                  <span
                    className="text-xs text-gray-400 uppercase tracking-wider"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                  >
                    {info.label}
                  </span>
                  <p
                    className="text-[#001856]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem" }}
                  >
                    {info.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-[#001856] rounded-2xl p-8 lg:p-10">
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl mb-6">
              <button
                onClick={() => switchTab("interesse")}
                className={`flex items-center justify-center cursor-pointer gap-2 py-3 px-4 rounded-lg transition-all ${
                  tab === "interesse"
                    ? "bg-[#ffc300] text-[#001856]"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <Heart size={16} />
                Tenho interesse
              </button>
              <button
                onClick={() => switchTab("apoio")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  tab === "apoio"
                    ? "bg-[#ffc300] text-[#001856]"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <Building2 size={16} />
                Quero apoiar
              </button>
              <button
                onClick={() => switchTab("doacao")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  tab === "doacao"
                    ? "bg-[#ffc300] text-[#001856]"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <QrCode size={16} />
                Doação direta
              </button>
            </div>

            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-12">
                <CheckCircle size={64} className="text-[#ffc300]" />
                <h3
                  className="text-white"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.8rem",
                  }}
                >
                  Mensagem enviada!
                </h3>
                <p
                  className="text-white/70 max-w-xs"
                  style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
                >
                  Obrigado pelo contato! Em breve nossa equipe entrará em contato com você.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="bg-[#ffc300] text-[#001856] px-8 py-3 rounded-full"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : tab === "doacao" ? (
              <div>
                <h3
                  className="text-white mb-2"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  Faça sua doação
                </h3>
                <p
                  className="text-white/60 mb-6"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  Contribua diretamente para que possamos manter as aulas, ensaios e
                  apresentações gratuitas para todos os músicos do projeto.
                </p>

                {!showQr ? (
                  <>
                    <p
                      className="text-white/80 mb-4"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600 }}
                    >
                      Escolha o valor da sua doação:
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {donationOptions.map((opt) => {
                        const active = donationAmount === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDonationAmount(opt.value)}
                            className={`py-4 rounded-xl border-2 transition-all ${
                              active
                                ? "bg-[#ffc300] border-[#ffc300] text-[#001856]"
                                : "border-white/20 text-white hover:border-[#ffc300]/60"
                            }`}
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      disabled={donationAmount === null}
                      onClick={() => setShowQr(true)}
                      className="w-full bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                    >
                      <QrCode size={18} />
                      Doar agora
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center bg-white/5 border border-[#ffc300]/30 rounded-xl p-6">
                    <button
                      type="button"
                      onClick={() => setShowQr(false)}
                      className="self-start flex items-center gap-1 text-white/60 hover:text-[#ffc300] mb-3 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
                    >
                      <ArrowLeft size={14} /> Alterar valor
                    </button>
                    <p
                      className="text-[#ffc300] uppercase tracking-widest mb-1"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "11px" }}
                    >
                      Doação via Pix
                    </p>
                    <p
                      className="text-white mb-4"
                      style={{
                        fontFamily: "'Instrument Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.75rem",
                      }}
                    >
                      {donationAmount === 0
                        ? "Valor a combinar"
                        : `R$ ${donationAmount?.toLocaleString("pt-BR")},00`}
                    </p>
                    <div className="bg-white p-3 rounded-xl mb-4">
                      <img
                        src={buildPixPayload(donationAmount ?? 0)}
                        alt={`QR Code para doação de R$ ${donationAmount}`}
                        className="w-52 h-52 block"
                      />
                    </div>
                    <p
                      className="text-white/60 max-w-xs"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", lineHeight: 1.6 }}
                    >
                      {donationAmount === 0
                        ? "Entre em contato pela aba 'Quero apoiar' para combinarmos o valor e enviarmos o QR Code personalizado."
                        : "Escaneie o QR Code com o app do seu banco para concluir a doação. Muito obrigado pelo apoio!"}
                    </p>
                  </div>
                )}
              </div>
            ) : tab === "interesse" ? (
              <>
                <h3
                  className="text-white mb-2"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  Conheça a filarmônica
                </h3>
                <p
                  className="text-white/60 mb-6"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  Para pais que querem inscrever seus filhos ou músicos interessados em participar.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Nome completo *
                      </label>
                      <input
                        name="nome"
                        value={interesseForm.nome}
                        onChange={handleChange}
                        required
                        placeholder="Seu nome"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Telefone
                      </label>
                      <input
                        name="telefone"
                        value={interesseForm.telefone}
                        onChange={handleChange}
                        placeholder="(XX) XXXXX-XXXX"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      E-mail *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={interesseForm.email}
                      onChange={handleChange}
                      required
                      placeholder="seu@email.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Instrumento de interesse
                    </label>
                    <select
                      name="instrumento"
                      value={interesseForm.instrumento}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffc300] transition-colors appearance-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <option value="" className="text-gray-800">Selecione um instrumento</option>
                      <option value="trompete" className="text-gray-800">Trompete</option>
                      <option value="trombone" className="text-gray-800">Trombone</option>
                      <option value="trompa" className="text-gray-800">Trompa</option>
                      <option value="bombardino" className="text-gray-800">Bombardino</option>
                      <option value="tuba" className="text-gray-800">Tuba</option>
                      <option value="outros" className="text-gray-800">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Mensagem (opcional)
                    </label>
                    <textarea
                      name="mensagem"
                      value={interesseForm.mensagem}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Conte um pouco sobre você e sua experiência musical..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors resize-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors mt-2"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                  >
                    <Send size={18} />
                    Enviar mensagem
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3
                  className="text-white mb-2"
                  style={{
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                  }}
                >
                  Apoie o projeto
                </h3>
                <p
                  className="text-white/60 mb-6"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  Para empresas, escolas e instituições que desejam patrocinar ou firmar parceria.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Empresa / Instituição *
                      </label>
                      <input
                        name="empresa"
                        value={apoioForm.empresa}
                        onChange={handleChange}
                        required
                        placeholder="Razão social"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Nome do responsável *
                      </label>
                      <input
                        name="responsavel"
                        value={apoioForm.responsavel}
                        onChange={handleChange}
                        required
                        placeholder="Quem está entrando em contato"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        E-mail *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={apoioForm.email}
                        onChange={handleChange}
                        required
                        placeholder="contato@empresa.com"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label
                        className="text-white/70 text-sm mb-1 block"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Telefone
                      </label>
                      <input
                        name="telefone"
                        value={apoioForm.telefone}
                        onChange={handleChange}
                        placeholder="(XX) XXXXX-XXXX"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Tipo de apoio
                    </label>
                    <select
                      name="tipo"
                      value={apoioForm.tipo}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ffc300] transition-colors appearance-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <option value="" className="text-gray-800">Selecione</option>
                      <option value="patrocinio" className="text-gray-800">Patrocínio</option>
                      <option value="parceria-escola" className="text-gray-800">Parceria com escola</option>
                      <option value="outros" className="text-gray-800">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Mensagem (opcional)
                    </label>
                    <textarea
                      name="mensagem"
                      value={apoioForm.mensagem}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Conte como sua empresa gostaria de apoiar o projeto..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors resize-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors mt-1"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                  >
                    <Send size={18} />
                    Enviar proposta de apoio
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}