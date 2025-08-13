"use client";
import Navbar from "./components/Navbar/Navbar";
import Menu from "./components/Menu/Menu";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";

import { useEffect, useState } from "react";

export default function Home() {
  const [productos, setProductos] = useState([]);
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
        const adaptados = (data.products || []).map((p: any) => ({
          src: p.imageUrl,
          alt: p.name,
          nombre: p.name,
          descripcion: p.descripcion || "",
          precio: `$${p.price}`,
        }));
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
