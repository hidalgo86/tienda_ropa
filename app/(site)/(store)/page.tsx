import Carrusel from "../../../components/Carrusel/Carrusel";
import ClientCards from "../../../components/ClientCards";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <main className="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-6 lg:pt-8">
        <div className="mt-2 sm:mt-4 lg:mt-0">
          <Carrusel />
        </div>

        <section className="mt-8 mb-8 sm:mt-12 sm:mb-12 lg:mt-16 lg:mb-16">
          <ClientCards />
        </section>
      </main>
    </div>
  );
}
