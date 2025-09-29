import Card from "../Card/Card";
import { Product } from "../../types/products";

interface CardsProps {
  productos?: Partial<Product>[];
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
    <div className="mt-10 mb-10 flex flex-wrap gap-6 justify-center">
      {productos.map((producto) => (
        <Card key={producto.id ?? Math.random()} producto={producto} />
      ))}
    </div>
  );
}
