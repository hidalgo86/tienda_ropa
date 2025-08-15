"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const imagenes = [
  { src: "/menuCategoria/bebe3.png", alt: "Bebé" },
  { src: "/menuCategoria/nino.png", alt: "Niño" },
  { src: "/menuCategoria/nina.png", alt: "Niña" },
  // { src: "/menuCategoria/extra.png", alt: "Complementos" },
  // { src: "/menuCategoria/marca.png", alt: "Marca" },
  // { src: "/menuCategoria/cuenta.png", alt: "Mi cuenta" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundColor: "#C39AFA" }}
      className="hidden sm:flex justify-center gap-x-26 pr-10 pl-10 sm:pr-20 sm:pl-20 xl:pr-30 xl:pl-30"
    >
      {imagenes.map((img, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => {
            if (img.alt === "Mi cuenta") {
              router.push("/dashboard");
            }
          }}
        >
          <Image src={img.src} alt={img.alt} width={60} height={60} />
          <span className="mt-1 mb-2 text-center">{img.alt}</span>
        </div>
      ))}
      <div
        className="flex items-center rounded-lg px-3 py-2 mt-5 mb-5 justify-center search-container bg-[#8AEAFB] hover:bg-[#E6F7FF]"
        style={{ minWidth: 180 }}
      >
        <FaSearch size={22} className="mr-2 search-icon" />
        <input
          type="text"
          placeholder="Buscar"
          className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full"
        />
        <style jsx>{`
          .search-icon {
            color: #333;
            transition: color 0.2s;
          }
          .search-container:hover .search-icon {
            color: #0074d9;
          }
        `}</style>
      </div>
    </div>
  );
}
