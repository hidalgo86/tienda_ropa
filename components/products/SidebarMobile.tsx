import Link from "next/link";
import Image from "next/image";
import React from "react";
import type { SidebarMobileProps } from "@/types/ui/products";

const SidebarMobile: React.FC<SidebarMobileProps> = ({
  items,
  activeOption,
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
    <div
      className="grid gap-1 py-2 px-2 safe-area-inset-bottom"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((img, idx) => (
        <Link
          key={idx}
          href={img.href}
          className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
            activeOption === img.alt
              ? "text-blue-600"
              : "text-gray-600 active:text-gray-900 hover:text-gray-800"
          }`}
        >
          <div
            className={`p-1.5 rounded-full transition-colors ${
              activeOption === img.alt
                ? "bg-blue-100"
                : "hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={20}
              height={20}
              className="flex-shrink-0"
            />
          </div>
          <span
            className={`text-xs mt-1 text-center truncate w-full leading-tight ${
              activeOption === img.alt ? "font-semibold" : "font-normal"
            }`}
          >
            {img.label}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

export default SidebarMobile;
