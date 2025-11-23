import { NextResponse } from "next/server";
import { getConnection } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

/**
 * Helper: procesa formData, sube imagen si existe y devuelve un objeto con los campos a actualizar.
 */
async function buildUpdateDataFromForm(formData) {
  const name = formData.get("name")?.toString().trim();
  const priceRaw = formData.get("price");
  const description = formData.get("description")?.toString().trim();
  const image = formData.get("image");

  const updateData = {};

  if (name !== null && name !== undefined) updateData.name = name;

  if (priceRaw !== null && priceRaw !== undefined && priceRaw !== "") {
    const parsed = Number(priceRaw);
    if (!Number.isNaN(parsed)) updateData.price = parsed;
    else updateData.price = priceRaw; // se guarda tal cual si no es numérico (puedes optar por validar)
  }

  if (description !== null && description !== undefined) updateData.description = description;

  if (image && image.size) {
    // processImage devuelve un Buffer listo para subir
    const buffer = await processImage(image);

    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "products" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
    updateData.image = uploaded.secure_url;
  }

  // eliminar campos undefined
  Object.keys(updateData).forEach((k) => {
    if (updateData[k] === undefined) delete updateData[k];
  });

  return updateData;
}

export async function GET(request, { params }) {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM product WHERE id = ?", [params.id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("ERROR GET /products/[id]:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const conn = await getConnection();
    const data = await request.formData();

    const updateData = await buildUpdateDataFromForm(data);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No data to update" }, { status: 400 });
    }

    const [result] = await conn.query("UPDATE product SET ? WHERE id = ?", [updateData, params.id]);

    return NextResponse.json({ message: "Product updated", affectedRows: result.affectedRows }, { status: 200 });
  } catch (error) {
    console.error("ERROR PUT /products/[id]:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * POST override: acepta POST con ?_method=PUT o formData._method === "PUT"
 * Esto es útil cuando el entorno no maneja PUT + multipart/form-data correctamente.
 */
export async function POST(request, { params }) {
  try {
    const url = new URL(request.url);
    const override = url.searchParams.get("_method");

    // leer formData (si hay multipart)
    const maybeForm = await request.formData().catch(() => null);
    const overrideFromForm = maybeForm ? maybeForm.get("_method") : null;

    const method = (overrideFromForm || override || "").toUpperCase();

    if (method === "PUT") {
      // Reusar lógica de actualización
      const formData = maybeForm || (await request.formData());
      const updateData = await buildUpdateDataFromForm(formData);

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No data to update" }, { status: 400 });
      }

      const conn = await getConnection();
      const [result] = await conn.query("UPDATE product SET ? WHERE id = ?", [updateData, params.id]);

      return NextResponse.json({ message: "Product updated (override)", affectedRows: result.affectedRows }, { status: 200 });
    }

    // Si no es override PUT, devolvemos 405 (creación por POST en /api/products está en el route sin [id])
    return NextResponse.json({ message: "Method not allowed on this route" }, { status: 405 });
  } catch (error) {
    console.error("ERROR POST (override) /products/[id]:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const conn = await getConnection();
    const [result] = await conn.query("DELETE FROM product WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Product deleted", affectedRows: result.affectedRows }, { status: 200 });
  } catch (error) {
    console.error("ERROR DELETE /products/[id]:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
