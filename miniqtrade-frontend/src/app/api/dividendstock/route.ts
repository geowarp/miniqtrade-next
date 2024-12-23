import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { restClient } from "@polygon.io/client-js";

dotenv.config();

// Create a Polygon.io REST client using your API key
const rest = restClient(process.env.POLYGON_API_KEY!);

// Define an interface for the API response
export interface DividendResponse {
  next_url?: string;
  results?: Array<{
    cash_amount?: number;
    declaration_date?: string;
    dividend_type?: string;
    ex_dividend_date?: string;
    frequency?: number;
    id?: string;
    pay_date?: string;
    record_date?: string;
    ticker?: string;
  }>;
  status?: string;
}

/**
 * GET /api/dividendstock?ticker=XYZ&ex_dividend_date=YYYY-MM-DD&record_date=YYYY-MM-DD&...
 */
export async function GET(req: Request): Promise<NextResponse> {
  // Parse the request URL
  const url = new URL(req.url);

  // Extract query string parameters and normalize null to undefined
  const params: Record<string, string | undefined> = {
    ticker: url.searchParams.get("ticker") || undefined,
    ex_dividend_date: url.searchParams.get("ex_dividend_date") || undefined,
    record_date: url.searchParams.get("record_date") || undefined,
    declaration_date: url.searchParams.get("declaration_date") || undefined,
    pay_date: url.searchParams.get("pay_date") || undefined,
    frequency: url.searchParams.get("frequency") || undefined,
    cash_amount: url.searchParams.get("cash_amount") || undefined,
    dividend_type: url.searchParams.get("dividend_type") || undefined,
    order: url.searchParams.get("order") || undefined,
    limit: url.searchParams.get("limit") || undefined,
    sort: url.searchParams.get("sort") || undefined,
  };

  // Validate required parameters
  if (!params.ticker) {
    return NextResponse.json(
      { error: "Missing required argument: ticker" },
      { status: 400 }
    );
  }

  try {
    // Filter out undefined parameters
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined)
    );

    // Call the Polygon.io endpoint with the filtered parameters
    const response: DividendResponse = await rest.reference.dividends(
      filteredParams
    );

    // Check for a valid response
    if (!response || response.status !== "OK") {
      return NextResponse.json(
        { error: `No dividend data found for the given criteria` },
        { status: 404 }
      );
    }

    // Return the successful response
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching dividend data:", error.message);
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
