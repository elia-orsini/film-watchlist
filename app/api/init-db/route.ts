import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json(
      { message: "Database initialized successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize database",
      },
      { status: 500 }
    );
  }
}
