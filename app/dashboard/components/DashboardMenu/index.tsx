import React from "react";

interface DashboardSidebarProps {
  opcion: string;
  menus: Record<string, string[]>;
}

export default function DashboardSidebar({ opcion, menus }: DashboardSidebarProps) {
  return (
    <aside
      style={{ backgroundColor: "#AEEFFF" }}
      className="fixed top-0 left-0 h-full w-64 shadow-lg p-6 flex flex-col z-20"
    >
      <h2 className="text-xl font-semibold mb-4">{opcion}</h2>
      <ul className="space-y-2">
        {menus[opcion]?.map((item, i) => (
          <li key={i} className="text-gray-700 hover:font-bold cursor-pointer">
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}