import { NextResponse } from "next/server"; // ✅ Import NextResponse
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
   
    await prisma.$connect(); // Ensure Prisma is connected

    const tableData = await prisma.batchdata.findMany({
      select: {
        id: true,
        item_id:true,
        lot:true,
        expiry:true,
        stock:true,
        mrp:true,
        team:true,
       
      },
    });

    console.log("Fetched stock data:", tableData);
    return NextResponse.json(tableData); // ✅ This will now work
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
