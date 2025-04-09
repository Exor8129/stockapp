import { NextResponse } from "next/server"; // ✅ Import NextResponse
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect(); // Ensure Prisma is connected

    const stockData = await prisma.stock_data.findMany({
      select: {
        id: true,
        sr_no: true,
        item: true,
        hsn_code: true,
        purchase_qty: true,
        sale_qty: true,
        stock_qty: true,
        rate: true,
        total_amount: true,
      },
    });

    // console.log("Fetched stock data:", stockData);
    return NextResponse.json(stockData); // ✅ This will now work
  } catch (error) {
    console.error("Database Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stock data", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req) {
  try {
    const { itemId, team } = await req.json();

    if (!itemId || !team) {
      return NextResponse.json({ error: "Missing itemId or team" }, { status: 400 });
    }

    const updatedItem = await prisma.stock_data.update({
      where: { id: parseInt(itemId) }, // ← itemId must match your primary key type
      data: { team },
    });

    return NextResponse.json({ success: true, updatedItem }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/stock error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}