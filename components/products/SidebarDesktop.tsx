import Link from "next/link";
import Image from "next/image";
import React from "react";

export interface SidebarItem {
  src: string;
  alt: string;
  label: string;
  href: string;
}

interface SidebarDesktopProps {
  items: SidebarItem[];
  activeOption: string;
}

const SidebarDesktop: React.FC<SidebarDesktopProps> = ({
  items,
  activeOption,
}) => (
  <aside className="w-full max-w-xs min-w-[220px] p-3 sm:p-4 lg:p-6 bg-white border-r border-gray-200 hidden md:block">
    <div className="flex flex-col items-center justify-start w-full h-full gap-4 lg:gap-6 pt-4">
      {items.map((img, idx) => (
        <Link
          key={idx}
          href={img.href}
          className={`flex flex-col items-center w-full p-2 lg:p-3 rounded-lg transition-all duration-200 ${
            activeOption === img.alt
              ? "bg-blue-100 text-blue-600 font-semibold shadow-sm"
              : "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
          }`}
        >
          <div className="flex flex-col items-center">
            <Image
              src={img.src}
              alt={img.alt}
              width={32}
              height={32}
              className="lg:w-10 lg:h-10 mb-1 lg:mb-2"
            />
            <span className="text-xs lg:text-sm text-center leading-tight">
              {img.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

export default SidebarDesktop;
