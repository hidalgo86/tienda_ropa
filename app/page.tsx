import Navbar from "./components/Navbar/Navbar";
import Menu from "./components/Menu/Menu";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";
import { Product } from "./types/products";

async function fetchProductos(): Promise<Product[]> {
  const res = await fetch("https://chikitoslandia.up.railway.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `{
        products {
          id
          name
          description
          genre
          size
          price
          stock
          imageUrl
          imagePublicId
          isActive
        }
      }`,
    }),
  });
  const { data } = await res.json() as { data: { products: Product[] } };
  return data.products || [];
}

export default async function Home() {
  const productos = await fetchProductos();
  return (
    <div>
      <Navbar />
      <Menu />
      {/* <Carrusel /> */}
      <Cards productos={productos} />
    </div>
  );
}
