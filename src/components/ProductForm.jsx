"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProductForm({ productId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!productId);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    async function loadProduct() {
      try {
        const res = await axios.get(`/api/products/${productId}`);
        if (cancelled) return;

        setProduct({
          name: res.data.name ?? "",
          price: res.data.price ?? "",
          description: res.data.description ?? "",
          image: null,
        });
        setPreview(res.data.image ?? null);
        setLoading(false);
      } catch (error) {
        console.error("Error loading product:", error);
        setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  function handleImageSelect(file) {
    setProduct({ ...product, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      if (product.image) formData.append("image", product.image);

      if (!productId) {
        await axios.post("/api/products", formData);
      } else {
        formData.append("_method", "PUT");
        await axios.post(`/api/products/${productId}?_method=PUT`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push("/products");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar");
    }
  }

  if (loading) return <p>Cargando producto...</p>;

  return (
    // Contenedor centrado horizontalmente pero debajo del título
    <div className="flex justify-center mt-6 mb-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-6 rounded w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-3 text-center">
          {productId ? "Editar Producto" : "Crear Producto"}
        </h2>

        {/* Nombre */}
        <div>
          <label className="block font-semibold">Nombre</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block font-semibold">Precio</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-semibold">Descripción</label>
          <textarea
            className="border p-2 rounded w-full"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block font-semibold">Imagen</label>
          <input
            type="file"
            className="border p-2 rounded w-full"
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />
        </div>

        {/* Vista previa */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-48 object-contain border rounded"
          />
        )}

        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {productId ? "Guardar Cambios" : "Crear Producto"}
        </button>
      </form>
    </div>
  );
}
