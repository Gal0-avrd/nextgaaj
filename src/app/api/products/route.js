import { NextResponse } from "next/server";
import { getConnection } from "@/libs/mysql";
import cloudinary from "@/libs/cloudinary";
import { processImage } from "@/libs/processImage";

// GET: obtener todos los productos
export async function GET() {
  try {
    const conn = await getConnection();
    const [results] = await conn.query("SELECT * FROM product");
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("ERROR GET /products:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: crear un producto
export async function POST(request) {
  try {
    const conn = await getConnection();
    const data = await request.formData();

    const name = data.get("name")?.toString().trim();
    const priceRaw = data.get("price");
    const description = data.get("description")?.toString().trim();
    const image = data.get("image");

    // Validaciones básicas
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    let price = null;
    if (priceRaw !== null && priceRaw !== undefined && priceRaw !== "") {
      // intenta convertir a número
      const parsed = Number(priceRaw);
      if (Number.isNaN(parsed)) {
        return NextResponse.json({ message: "Price must be a number" }, { status: 400 });
      }
      price = parsed;
    }

    let imageUrl = null;

    if (image && image.size) {
      // processImage devuelve un Buffer listo para subir
      const buffer = await processImage(image);

      // subir a Cloudinary
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

      imageUrl = uploaded.secure_url;
    }

    const insertObj = {
      name,
      price,
      description,
      image: imageUrl,
    };

    // Elimina campos undefined para evitar inserciones inesperadas
    Object.keys(insertObj).forEach((k) => {
      if (insertObj[k] === undefined) delete insertObj[k];
    });

    const [result] = await conn.query("INSERT INTO product SET ?", insertObj);

    return NextResponse.json(
      {
        id: result.insertId,
        name,
        price,
        description,
        image: imageUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR POST /products:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
