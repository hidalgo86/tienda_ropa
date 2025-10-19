"use client";

import dynamic from "next/dynamic";

const DynamicCards = dynamic(() => import("./Cards/Cards"), {
  ssr: false,
  loading: () => (
    <div className="text-center py-6 sm:py-10 lg:py-12">
      <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-gray-900"></div>
      <p className="mt-2 text-sm sm:text-base text-gray-600">
        Cargando productos...
      </p>
    </div>
  ),
});

export default function ClientCards() {
  return <DynamicCards />;
}
