import Navbar from "./components/Navbar";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4">
        <Carrusel />

        <div className="mt-10 mb-10">
          <Cards />
        </div>
      </main>
      <Footer />
    </div>
  );
}
