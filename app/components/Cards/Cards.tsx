import Card from "../Card/Card";
import { ProductServer } from "@/types/product.type";

interface CardsProps {
  productos?: ProductServer[];
}

export default function Cards({ productos = [] }: CardsProps) {
  if (productos.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No hay productos para mostrar.
      </p>
    );
  }

  return (
    <div className="mt-10 mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
      {productos.map((producto) => (
        <Card key={producto.id ?? Math.random()} producto={producto} />
      ))}
    </div>
  );
}

