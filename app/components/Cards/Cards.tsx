import Card from "../Card/Card";

interface Producto {
  src: string;
  alt: string;
  nombre: string;
  descripcion: string;
  precio: string;
}

interface CardsProps {
  productos: Producto[];
}

export default function Cards({ productos }: CardsProps) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {productos.map((producto, idx) => (
        <Card key={idx} producto={producto} />
      ))}
    </div>
  );
}
