import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create batch data (POST)
export async function POST(req) {
  try {
    const { itemId, batchFields, team } = await req.json();

    if (!itemId || !batchFields || !Array.isArray(batchFields)) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Insert batch data
    await prisma.batchdata.createMany({
      data: batchFields.map((batch) => ({
        item_id: Number(itemId),
        lot: batch.lot,
        expiry: batch.expiry,
        stock: Number(batch.stock),
        mrp: Number(batch.mrp),
        team: team,
      })),
    });

    // Fetch newly created batches
    const createdBatches = await prisma.batchdata.findMany({
      where: { item_id: Number(itemId) },
    });

    return NextResponse.json({ success: true, data: createdBatches });
  } catch (error) {
    console.error("❌ Error saving batch data:", error);
    return NextResponse.json({ error: "Failed to save batch data", details: error.message }, { status: 500 });
  }
}

// ✅ Get batch data by itemId (GET)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const batchData = await prisma.batchdata.findMany({
      where: { item_id: Number(itemId) },
    });

    return NextResponse.json(batchData);
  } catch (error) {
    console.error("❌ Error fetching batch data:", error);
    return NextResponse.json({ error: "Failed to fetch batch data", details: error.message }, { status: 500 });
  }
}

// ✅ Update specific batches (PUT)
export async function PUT(req) {
  try {
    const { batchFields } = await req.json();

    if (!batchFields || !Array.isArray(batchFields)) {
      return NextResponse.json({ error: "Invalid batch data" }, { status: 400 });
    }

    // Update each batch individually
    const updatedBatches = await Promise.all(
      batchFields.map(async (batch) => {
        return prisma.batchdata.update({
          where: { id: Number(batch.id) },
          data: {
            lot: batch.lot,
            expiry: batch.expiry,
            stock: Number(batch.stock),
            mrp: Number(batch.mrp),
            team: batch.team,
          },
        });
      })
    );

    return NextResponse.json({ success: true, data: updatedBatches });
  } catch (error) {
    console.error("❌ Error updating batch:", error);
    return NextResponse.json({ error: "Failed to update batch", details: error.message }, { status: 500 });
  }
}

// ✅ Delete batch data (DELETE)
export async function DELETE(req) {
    try {
      const { searchParams } = new URL(req.url);
      const batchId = searchParams.get("batchId");
  
      console.log("🗑️ DELETE Request Received for Batch ID:", batchId); // Log the batchId
  
      if (!batchId || isNaN(Number(batchId))) {
        console.warn("⚠️ Invalid batchId:", batchId);
        return NextResponse.json({ error: "Invalid batchId" }, { status: 400 });
      }
  
      await prisma.batchdata.delete({
        where: { id: Number(batchId) },
      });
  
      console.log("✅ Batch deleted successfully:", batchId);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("❌ Error deleting batch:", error);
      return NextResponse.json({ error: "Failed to delete batch", details: error.message }, { status: 500 });
    }
  }
  
