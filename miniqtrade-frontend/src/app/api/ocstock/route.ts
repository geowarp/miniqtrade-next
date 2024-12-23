import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { restClient } from "@polygon.io/client-js";

dotenv.config();

// Create a Polygon.io REST client using your API key
const rest = restClient(process.env.POLYGON_API_KEY!);

// Optional: Define an interface for the API response
export interface StocksDailyOpenCloseResponse {
  afterHours?: number | null;
  close?: number | null;
  from?: string;
  high?: number | null;
  low?: number | null;
  open?: number | null;
  preMarket?: number | null;
  status?: string;
  symbol?: string;
  volume?: number | null;
}

/**
 * GET /api/ocstock?symbol=XYZ&from=YYYY-MM-DD&adjusted=true
 */
export async function GET(req: Request): Promise<NextResponse> {
  // Parse the request URL
  const url = new URL(req.url);

  // Extract query string parameters
  const symbol = url.searchParams.get("symbol");
  const from = url.searchParams.get("from");
  const adjusted = url.searchParams.get("adjusted");

  // Validate required parameters
  if (!symbol || !from) {
    return NextResponse.json(
      { error: "Missing required arguments: symbol or from" },
      { status: 400 }
    );
  }

  try {
    // Call Polygon.io endpoint using the extracted parameters
    const response: StocksDailyOpenCloseResponse =
      await rest.stocks.dailyOpenClose(symbol, from, {
        adjusted: adjusted === "false" ? "false" : "true",
      });

    // Check for a valid response
    if (!response || response.status !== "OK") {
      return NextResponse.json(
        { error: `Data not found for ${symbol} on ${from}` },
        { status: 404 }
      );
    }

    // Return the successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching data:", error.message);
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
