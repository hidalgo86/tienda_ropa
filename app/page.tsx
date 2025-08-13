"use client";
import Navbar from "./components/Navbar/Navbar";
import Menu from "./components/Menu/Menu";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";

import { useEffect, useState } from "react";

export default function Home() {
  interface ProductoCard {
    src: string;
    alt: string;
    nombre: string;
    descripcion: string;
    precio: string;
  }
  const [productos, setProductos] = useState<ProductoCard[]>([]);
  useEffect(() => {
    fetch("https://chikitoslandia.up.railway.app/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          products {
            id
            name
            category
            price
            stock
            imageUrl
            description
          }
        }`,
      }),
    })
      .then((res) => res.json())
      .then(({ data }) => {
        // Adaptar los datos al formato esperado por Cards
        const adaptados = (data.products || []).map(
          (p: {
            imageUrl: string;
            name: string;
            description?: string;
            price: number;
          }) => ({
            src: p.imageUrl,
            alt: p.name,
            nombre: p.name,
            descripcion: p.description || "",
            precio: `$${p.price}`,
          })
        );
        setProductos(adaptados);
      });
  }, []);

  return (
    <div>
      <Navbar />
      <Menu />
      <Carrusel />
      <Cards productos={productos} />
    </div>
  );
}
