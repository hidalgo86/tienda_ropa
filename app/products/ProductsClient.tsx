"use client";

import { useState } from "react";
import FiltrosModal from "../components/FiltrosModal";

interface ProductsClientProps {
  children: React.ReactNode;
  filtrosButton: React.ReactNode;
}

export default function ProductsClient({
  children,
  filtrosButton,
}: ProductsClientProps) {
  const [isFiltrosModalOpen, setIsFiltrosModalOpen] = useState(false);

  const handleFiltrosClick = () => {
    setIsFiltrosModalOpen(true);
  };

  const closeFiltrosModal = () => {
    setIsFiltrosModalOpen(false);
  };

  return (
    <>
      <div onClick={handleFiltrosClick}>{filtrosButton}</div>
      {children}
      <FiltrosModal isOpen={isFiltrosModalOpen} onClose={closeFiltrosModal} />
    </>
  );
}
