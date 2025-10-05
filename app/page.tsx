import Navbar from "./components/Navbar";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";
import Footer from "./components/Footer";
import { getProducts } from "@/services/products.services";

export default async function Home() {
  const productos = await getProducts(1);

  return (
    <div className="bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4">
        <Carrusel />

        <div className="mt-10 mb-10">
          <Cards productos={productos.items} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
