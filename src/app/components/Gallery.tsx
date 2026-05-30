const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1763627516727-2ca3e324fa59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Filarmônica em concerto",
    caption: "Grande Concerto Anual 2025",
  },
  {
    src: "https://images.unsplash.com/photo-1653324650979-015a4402a57f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Ensaio coletivo",
    caption: "Ensaio semanal em preparação",
  },
  {
    src: "https://images.unsplash.com/photo-1777226407432-801354c2ea42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Apresentação especial",
    caption: "Noite de Gala — Teatro Municipal",
  },
  {
    src: "https://images.unsplash.com/photo-1709145234621-30c08c457fb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Jovens músicos da filarmônica",
    caption: "Formatura dos novos músicos",
  },
  {
    src: "https://images.unsplash.com/photo-1777730864372-c8d57f01d0f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Apresentação dos metais",
    caption: "Concerto especial em uniforme",
  },
  {
    src: "https://images.unsplash.com/photo-1719753458800-c09cfb167ac5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    alt: "Maestro e orquestra",
    caption: "Temporada 2025 — Sala de Concertos",
  },
];

export function Gallery() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span
              className="text-[#ffc300] uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "13px" }}
            >
              Momentos
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
              Confira nossos melhores momentos
            </h2>
          </div>
          <p
            className="text-gray-500 max-w-sm"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}
          >
            Acompanhe a trajetória e as apresentações da Filarmônica de Metais ao longo dos anos.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl group cursor-pointer"
            >
              <div className="aspect-[4/3] w-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#001856]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <p
                  className="text-white"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "15px" }}
                >
                  {img.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
