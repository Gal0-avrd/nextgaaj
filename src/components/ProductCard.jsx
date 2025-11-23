"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation(); // evita que clics se vayan a otra acción
    setOpenMenu(!openMenu);
  };

  return (
    <div className="relative">

      {/* CARD DEL PRODUCTO — ya NO tiene Link */}
      <div
        onClick={toggleMenu}
        className="p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer"
      >
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
      </div>

      {/* MENÚ FLOTANTE */}
      {openMenu && (
        <div
          className="absolute top-0 right-0 mt-2 w-40 bg-white border shadow-lg rounded p-2 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/products/edit/${product.id}`}>
            <button className="block text-blue-600 hover:underline w-full text-left p-1">
              Editar
            </button>
          </Link>

          <Link href={`/products/delete/${product.id}`}>
            <button className="block text-red-600 hover:underline w-full text-left p-1">
              Eliminar
            </button>
          </Link>

          <button
            onClick={() => setOpenMenu(false)}
            className="block text-gray-500 hover:underline text-sm p-1"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
