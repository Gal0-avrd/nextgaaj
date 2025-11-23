import { NextResponse } from "next/server";
import { getConnection } from "@/libs/mysql";

export async function GET() {
  const conn = await getConnection();
  const [result] = await conn.query("SELECT NOW()");

  return NextResponse.json({
    message: result[0]["NOW()"]
  });
}
