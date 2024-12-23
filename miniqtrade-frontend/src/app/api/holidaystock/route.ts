import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { restClient } from "@polygon.io/client-js";

dotenv.config();

// Create a Polygon.io REST client using your API key
const rest = restClient(process.env.POLYGON_API_KEY!);

// Define an interface for the API response
export interface MarketStatusResponse {
  date?: string;
  exchang?: string;
  name?: string;
  status?: string;
  open?: string;
  close?: string;
}
/**
 * GET /api/holidaystock
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Call the Polygon.io endpoint to get upcoming market status
    const response: MarketStatusResponse[] =
      await rest.reference.marketHolidays();

    // Check for a valid response
    if (!response || response.length === 0) {
      return NextResponse.json(
        { error: "No upcoming market holidays found" },
        { status: 404 }
      );
    }

    // Return the successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching market status data:", error.message);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
