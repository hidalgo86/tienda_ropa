import Navbar from "./components/Navbar";
import Carrusel from "./components/Carrusel/Carrusel";
import ClientCards from "./components/ClientCards";
import FooterWrapper from "./components/FooterWrapper";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-20 md:pb-6 lg:pb-4">
        {/* Carrusel con espaciado responsivo */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <Carrusel />
        </div>

        {/* Sección de productos con espaciado responsivo */}
        <section className="mt-8 sm:mt-12 lg:mt-16 mb-8 sm:mb-12 lg:mb-16">
          <ClientCards />
        </section>
      </main>
      <FooterWrapper />
    </div>
  );
}
