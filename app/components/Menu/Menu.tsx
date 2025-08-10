"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const imagenes = [
  { src: "/menuCategoria/bebe.png", alt: "Bebé" },
  { src: "/menuCategoria/nino.png", alt: "Niño" },
  { src: "/menuCategoria/nina.png", alt: "Niña" },
  { src: "/menuCategoria/complementos.png", alt: "Complementos" },
  { src: "/menuCategoria/marca.png", alt: "Marca" },
  { src: "/menuCategoria/cuenta.png", alt: "Mi cuenta" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{ backgroundColor: "#AEEFFF" }}
      className="hidden md:flex justify-center gap-x-6 pr-10 pl-10 sm:pr-20 sm:pl-20 xl:pr-30 xl:pl-30"
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
    </div>
  );
}
