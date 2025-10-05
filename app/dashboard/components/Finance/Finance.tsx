"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Movimiento {
  fecha: string;
  monto: number;
}

interface FinanzasProps {
  ventas: Movimiento[];
  compras: Movimiento[];
}

export default function Finance({ ventas, compras }: FinanzasProps) {
  // Preparar datos para los gráficos
  const labels = ventas.map((v) => v.fecha);

  const dataVentas = {
    labels,
    datasets: [
      {
        label: "Ventas",
        data: ventas.map((v) => v.monto),
        backgroundColor: "#4F8DFD",
      },
    ],
  };

  const dataCompras = {
    labels,
    datasets: [
      {
        label: "Compras",
        data: compras.map((c) => c.monto),
        backgroundColor: "#FFB6B3",
      },
    ],
  };

  const dataComparacion = {
    labels,
    datasets: [
      {
        label: "Ventas",
        data: ventas.map((v) => v.monto),
        backgroundColor: "#4F8DFD",
      },
      {
        label: "Compras",
        data: compras.map((c) => c.monto),
        backgroundColor: "#FFB6B3",
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-2">Ventas</h2>
        <Bar data={dataVentas} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Compras</h2>
        <Bar data={dataCompras} />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Comparación</h2>
        <Bar data={dataComparacion} />
      </div>
    </div>
  );
}
