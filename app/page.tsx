import Navbar from "./components/Navbar";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";
import { getProducts } from "@/utils/getProducts";

export default async function Home() {
  const productos = await getProducts(1);
  return (
    <div>
      <Navbar />
      <Carrusel />
      <Cards productos={productos.items} />
    </div>
  );
}
