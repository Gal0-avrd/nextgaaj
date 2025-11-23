import { getConnection } from "@/libs/mysql";
import Buttons from "./Buttons"; // ruta correcta según tu estructura

async function loadProduct(productId) {
  const conn = await getConnection(); // obtiene la conexión
  const [data] = await conn.query("SELECT * FROM product WHERE id = ?", [productId]);
  return data[0]; // primer producto
}

export default async function ProductPage({ params }) {
  const product = await loadProduct(params.id);

  if (!product) return <p className="text-center mt-10">Producto no encontrado</p>;

  return (
    <section className="flex justify-center items-center h-[calc(100vh-10rem)]">
      <div className="flex w-4/6 h-2/6 justify-center gap-6">
        <div className="p-6 bg-white w-1/3 rounded-xl shadow">
          <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
          <h4 className="text-4xl font-bold mb-2">{product.price}$</h4>
          <p className="text-slate-700 mb-4">{product.description}</p>
          <Buttons productId={product.id} />
        </div>
        {product.image && (
          <img
            src={product.image}
            className="w-1/3 object-cover rounded-xl shadow"
            alt={product.name}
          />
        )}
      </div>
    </section>
  );
}
