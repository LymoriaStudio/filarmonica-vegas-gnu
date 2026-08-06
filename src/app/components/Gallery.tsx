import mome1 from '@/imports/momentos/mome1.jpeg'
import mome2 from '@/imports/momentos/mome2.jpeg'
import mome3 from '@/imports/momentos/mome3.jpeg'
import mome4 from '@/imports/momentos/mome4.jpeg'
import mome5 from '@/imports/momentos/mome5.jpeg'
import mome6 from '@/imports/momentos/mome6.png'




const galleryImages = [
    {
    src: mome1,
    alt: "Apresentação de música",
    caption: "Concerto de Encerramento de 2025",
  },
      {
    src: mome2,
    alt: "Apresentação de música",
    caption: "Concerto de Encerramento de 2025",
  },
      {
    src: mome3,
    alt: "Apresentação de música",
    caption: "Concerto de Encerramento de 2025",
  },
  {
    src: mome4,
    alt: "Apresentação de música",
    caption: "Concerto de Encerramento de 2024",
  },
  {
    src: mome5,
    alt: "Apresentação de música",
    caption: "Concerto de Encerramento de 2024",
  },
  {
    src: mome6,
    alt: "Apresentação de música",
    caption: "Concerto de Meio de Ano de 2026",
  }

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
