"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-cache",
  });
  return res.json();
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  // Cargar productos
  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
    }
    load();
  }, []);

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Productos</h1>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`} // Redirige a la página de detalle
            className="bg-white rounded-xl shadow hover:scale-105 cursor-pointer transition overflow-hidden"
          >
            {/* Imagen */}
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}

            {/* Info */}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-700 text-lg">${product.price}</p>
              <p className="text-gray-500">{product.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
