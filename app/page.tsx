import Navbar from "./components/Navbar/Navbar";
import Menu from "./components/Menu/Menu";
import Carrusel from "./components/Carrusel/Carrusel";
import Cards from "./components/Cards/Cards";

const productosMock = [
  {
    src: "/ropa/conjunto.webp",
    alt: "Conjunto de bebé azul pastel",
    nombre: "Conjunto de Bebé Azul Pastel",
    descripcion:
      "Suave conjunto de algodón para bebé, incluye body, pantalón y gorrito. Ideal para primavera y verano.",
    precio: "$24.99",
  },
  {
    src: "/ropa/vestido.webp",
    alt: "Vestido rosa para niña",
    nombre: "Vestido Rosa para Niña",
    descripcion:
      "Vestido de fiesta en tono rosa pastel, cómodo y elegante para ocasiones especiales.",
    precio: "$29.99",
  },
  {
    src: "/ropa/pijama.jpg",
    alt: "Pijama de estrellas",
    nombre: "Pijama de Estrellas",
    descripcion:
      "Pijama suave y abrigada con estampado de estrellas, perfecta para las noches frescas.",
    precio: "$19.99",
  },
];

export default function Home() {
  return (
    <div>
      <Navbar />
      <Menu />
      <Carrusel />
      <Cards productos={productosMock} />
    </div>
  );
}
