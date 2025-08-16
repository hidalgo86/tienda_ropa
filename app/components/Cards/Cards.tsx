import Card from "../Card/Card";
import { Product } from "../../types/products";

export default function Cards({
  productos,
}: {
  productos: Partial<Product>[];
}) {
  return (
    <div className="mt-10 mb-10 flex flex-wrap gap-6 justify-center">
      {productos.map((producto, id) => (
        <Card key={id} producto={producto} />
      ))}
    </div>
  );
}
