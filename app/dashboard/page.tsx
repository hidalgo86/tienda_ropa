"use client";
import { useState, useEffect } from "react";
import Menu from "./components/Menu/Menu";
import Body from "./components/Body/Body";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [opcion, setOpcion] = useState("Clientes");
  const router = useRouter();

  useEffect(() => {
    if (opcion === "Salir") {
      router.push("/");
    }
  }, [opcion, router]);

  return (
    <div>
      <Menu opcion={opcion} setOpcion={setOpcion} />
      <Body
        mostrar={
          opcion as "Clientes" | "Proveedores" | "Productos" | "Finanzas"
        }
      />
    </div>
  );
}
