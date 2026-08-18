import { Buffer } from "buffer";
window.Buffer = Buffer;
import { useState } from "react";
import * as yup from "yup";
import { Send, Phone, Mail, MapPin, CheckCircle, Heart, Building2, QrCode, ArrowLeft, ChevronDown } from "lucide-react";
// import { QrCodePix } from "qrcode-pix"; // geração automática de Pix comentada
// import { QRCodeSVG } from "qrcode.react"; // geração automática de Pix comentada
import { schemaInteresse } from "../validations/contactRules";
import { createInteressado } from "../services/interessadosService";
import { createApoiador } from "../services/useApoiadores";
import { createDoacao } from "../services/doacoesService";
import qrcode100 from "../../images/qrcode-100.png";
import qrcode300 from "../../images/qrcode-300.png";
import qrcode1000 from "../../images/qrcode-1000.png";
import qrcodeDefinir from "../../images/qrcode-definir.png";
import interesseImage from "../../images/c-tenhointeresse.jpeg"
import apoioImage from "../../images/c-apoio.jpeg"
import doacaoImage from "../../images/c-doacao.jpeg"


type Tab = "interesse" | "apoio" | "doacao";
type DonorType = "fisica" | "juridica";




const QR_IMAGES: Record<number, string> = {
  100: qrcode100,
  300: qrcode300,
  1000: qrcode1000,
  0: qrcodeDefinir,
};

const donationOptions = [
  { value: 100, label: "R$ 100" },
  { value: 300, label: "R$ 300" },
  { value: 1000, label: "R$ 1.000" },
  { value: 0, label: "A definir" },
];

export function Contact() {
  const [tab, setTab] = useState<Tab>("interesse");
  const [sent, setSent] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [loadingDoacao, setLoadingDoacao] = useState(false);
  const [donorType, setDonorType] = useState<DonorType>("fisica");
  const [donorForm, setDonorForm] = useState({ nome: "", cpf: "", email: "" });
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
  const [erros, setErros] = useState<Record<string, string>>({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  // const pixPayload = ... // geração automática de Pix comentada

  const handleDoareAgora = async () => {
    if (donationAmount === null) return;

    setLoadingDoacao(true);
    try {
      await createDoacao({
        amount: donationAmount,
        donor_name: donorForm.nome || null,
        donor_type: donorType,
        donor_cpf: donorForm.cpf || null,
        donor_email: donorForm.email || null,
      });
    } catch (err) {
      console.error("Erro ao registrar doação no Supabase:", err);
    } finally {
      setLoadingDoacao(false);
    }

    setShowQr(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const WHATSAPP_NUMBER = "5519998453478";
    let mensagem = "";

    if (tab === "interesse") {
      try {
        await schemaInteresse.validate(interesseForm, { abortEarly: false });
        setErros({});
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: Record<string, string> = {};
          error.inner.forEach((e) => {
            if (e.path) validationErrors[e.path] = e.message;
          });
          setErros(validationErrors);
        }
        return;
      }

      setLoadingSubmit(true);
      try {
        await createInteressado({
          name: interesseForm.nome,
          email: interesseForm.email,
          phone: interesseForm.telefone || "",
          age: null,
          instrument_of_interest: interesseForm.instrumento || "Não informado",
          message: interesseForm.mensagem || null,
        });
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err);
      } finally {
        setLoadingSubmit(false);
      }

      mensagem = [
        "🎺 *Olá tenho interesse na Filarmônica de Metais*",
        "",
        `*Nome:* ${interesseForm.nome}`,
        `*E-mail:* ${interesseForm.email}`,
        `*Telefone:* ${interesseForm.telefone || "Não informado"}`,
        `*Instrumento:* ${interesseForm.instrumento || "Não informado"}`,
        `*Mensagem:* ${interesseForm.mensagem || "Nenhuma mensagem"}`,
      ].join("\n");

    } else {
      setLoadingSubmit(true);
      try {
        await createApoiador({
          name: apoioForm.responsavel,
          company: apoioForm.empresa || null,
          email: apoioForm.email,
          phone: apoioForm.telefone || "",
          support_type: apoioForm.tipo || "Não informado",
          message: apoioForm.mensagem || null,
        });
      } catch (err) {
        console.error("Erro ao salvar apoiador no Supabase:", err);
      } finally {
        setLoadingSubmit(false);
      }

      mensagem = [
        "🏢 *Nova proposta de apoio — Filarmônica de Metais*",
        "",
        `*Empresa:* ${apoioForm.empresa}`,
        `*Responsável:* ${apoioForm.responsavel}`,
        `*E-mail:* ${apoioForm.email}`,
        `*Telefone:* ${apoioForm.telefone || "Não informado"}`,
        `*Tipo de apoio:* ${apoioForm.tipo || "Não informado"}`,
        `*Mensagem:* ${apoioForm.mensagem || "Nenhuma mensagem"}`,
      ].join("\n");
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const setter = tab === "interesse" ? setInteresseForm : setApoioForm;
    let value = e.target.value;

    if (e.target.name === "telefone") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }

    setter((f: any) => ({ ...f, [e.target.name]: value }));

    if (erros[e.target.name]) {
      setErros((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setSent(false);
    setDonationAmount(null);
    setShowQr(false);
    setErros({});
    setDonorType("fisica");
    setDonorForm({ nome: "", cpf: "", email: "" });
  };

  const imagesContact = {
    "interesse": interesseImage,
    "apoio": apoioImage,
    "doacao": doacaoImage,
  }

  return (
    <section id="contato" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
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
                src={imagesContact[tab]}
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
                { icon: <Phone size={22} />, label: "Telefone", value: "(19) 99845-3478" },
                { icon: <Mail size={22} />, label: "E-mail", value: "filarmonicademetais@gmail.com" },
                { icon: <MapPin size={22} />, label: "Endereço", value: "R. Padre Avelino Canaza, 258 – Vila Galo, Americana – SP" },
              ].map((info, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex flex-col break-all gap-2">
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
                  tab === "interesse" ? "bg-[#ffc300] text-[#001856]" : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <Heart size={16} />
                Tenho interesse
              </button>
              <button
                onClick={() => switchTab("apoio")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  tab === "apoio" ? "bg-[#ffc300] text-[#001856]" : "text-white/70 hover:text-white"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <Building2 size={16} />
                Quero apoiar
              </button>
              <button
                onClick={() => switchTab("doacao")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  tab === "doacao" ? "bg-[#ffc300] text-[#001856]" : "text-white/70 hover:text-white"
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
                  style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.8rem" }}
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
                  style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}
                >
                  Faça sua doação
                </h3>
                <p
                  className="text-white/60 mb-6"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  Contribua diretamente para que possamos manter as aulas, ensaios e apresentações gratuitas para todos os músicos do projeto.
                </p>

                {!showQr ? (
                  <>
                    {/* Identificação do doador */}
                    <p
                      className="text-white/80 mb-3"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600 }}
                    >
                      Identificação do doador:
                    </p>

                    {/* Toggle Pessoa Física / Jurídica */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setDonorType("fisica")}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          donorType === "fisica"
                            ? "bg-[#ffc300] border-[#ffc300] text-[#001856]"
                            : "border-white/20 text-white hover:border-[#ffc300]/60"
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}
                      >
                        Pessoa Física
                      </button>
                      <button
                        type="button"
                        onClick={() => setDonorType("juridica")}
                        className={`py-3 rounded-xl border-2 transition-all ${
                          donorType === "juridica"
                            ? "bg-[#ffc300] border-[#ffc300] text-[#001856]"
                            : "border-white/20 text-white hover:border-[#ffc300]/60"
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}
                      >
                        Pessoa Jurídica
                      </button>
                    </div>

                    {/* Campos do doador */}
                    <div className="flex flex-col gap-3 mb-5">
                      <input
                        type="text"
                        placeholder="Nome completo *"
                        value={donorForm.nome}
                        onChange={(e) => setDonorForm((f) => ({ ...f, nome: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <input
                        type="text"
                        placeholder={donorType === "fisica" ? "CPF: 000.000.000-00 *" : "CNPJ: 00.000.000/0000-00 *"}
                        value={donorForm.cpf}
                        onChange={(e) => setDonorForm((f) => ({ ...f, cpf: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      <input
                        type="email"
                        placeholder="E-mail (opcional)"
                        value={donorForm.email}
                        onChange={(e) => setDonorForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#ffc300] transition-colors"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                    </div>

                    {/* Valor da doação */}
                    <p
                      className="text-white/80 mb-3"
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
                      disabled={donationAmount === null || loadingDoacao}
                      onClick={handleDoareAgora}
                      className="w-full cursor-pointer bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                    >
                      <QrCode size={18} />
                      {loadingDoacao ? "Registrando..." : "Gerar QR Code e Doar"}
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
                      style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.75rem" }}
                    >
                      {donationAmount === 0
                        ? "Valor a combinar"
                        : `R$ ${donationAmount?.toLocaleString("pt-BR")},00`}
                    </p>
                    {/* QR Code estático por valor */}
                    <div className="bg-white p-3 rounded-xl mb-4">
                      <img
                        src={QR_IMAGES[donationAmount ?? 0]}
                        alt={`QR Code Pix R$ ${donationAmount}`}
                        className="w-52 h-52 object-contain"
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
                  style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}
                >
                  Conheça a filarmônica
                </h3>
                <p
                  className="text-white/60 mb-6"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.6 }}
                >
                  Para pais que querem inscrever seus filhos ou músicos interessados em participar.
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                        placeholder="Seu nome"
                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors ${
                          erros.nome ? "border-red-400" : "border-white/20"
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      {erros.nome && <p className="text-red-400 text-xs mt-1">{erros.nome}</p>}
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
                        type="tel"
                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors ${
                          erros.telefone ? "border-red-400" : "border-white/20"
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      />
                      {erros.telefone && <p className="text-red-400 text-xs mt-1">{erros.telefone}</p>}
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
                      placeholder="seu@email.com"
                      className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ffc300] transition-colors ${
                        erros.email ? "border-red-400" : "border-white/20"
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                    {erros.email && <p className="text-red-400 text-xs mt-1">{erros.email}</p>}
                  </div>

                  <div>
                    <label
                      className="text-white/70 text-sm mb-1 block"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Instrumento de interesse
                    </label>
                    <div className="relative">
                      <select
                        name="instrumento"
                        value={interesseForm.instrumento}
                        onChange={handleChange}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#ffc300] transition-colors appearance-none cursor-pointer"
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
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>
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
                    disabled={loadingSubmit}
                    className="bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                  >
                    <Send size={18} />
                    {loadingSubmit ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </form>
              </>

            ) : (
              <>
                <h3
                  className="text-white mb-2"
                  style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: "1.5rem" }}
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
                    <div className="relative">
                      <select
                        name="tipo"
                        value={apoioForm.tipo}
                        onChange={handleChange}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-[#ffc300] transition-colors appearance-none cursor-pointer"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <option value="" className="text-gray-800">Selecione</option>
                        <option value="patrocinio" className="text-gray-800">Patrocínio</option>
                        <option value="parceria-escola" className="text-gray-800">Parceria com escola</option>
                        <option value="outros" className="text-gray-800">Outros</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>
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
                    disabled={loadingSubmit}
                    className="bg-[#ffc300] text-[#001856] py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                  >
                    <Send size={18} />
                    {loadingSubmit ? "Enviando..." : "Enviar proposta de apoio"}
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