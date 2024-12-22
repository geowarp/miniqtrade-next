import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { restClient } from "@polygon.io/client-js";

dotenv.config();

const rest = restClient(process.env.POLYGON_API_KEY);

export async function GET(
  req: Request,
  context: { params: { stocksTicker: string; date: string } }
) {
  const { params } = context;
  const { stocksTicker, date } = await params; // Await params here

  if (!stocksTicker || !date) {
    return NextResponse.json(
      { error: "Missing required arguments: Stocks-Ticker Symbol or Date" },
      { status: 400 }
    );
  }

  try {
    const response = await rest.stocks.dailyOpenClose(stocksTicker, date);

    if (!response || response.status !== "OK") {
      return NextResponse.json(
        { error: `Data not found for ${stocksTicker} on ${date}` },
        { status: 404 }
      );
    }

    const {
      afterHours,
      close,
      from,
      high,
      low,
      open,
      preMarket,
      status,
      symbol,
      volume,
    } = response;

    return NextResponse.json(
      {
        afterHours,
        close,
        from,
        high,
        low,
        open,
        preMarket,
        status,
        symbol,
        volume,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching data:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
