// /src/api/opencloseStock/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
import { restClient } from "@polygon.io/client-js";

dotenv.config();

const rest = restClient(process.env.POLYGON_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate the HTTP method
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Extract the stock ticker and date from the request query
    const { stocksTicker, date } = req.query;

    // Validate the query parameters
    if (!stocksTicker || !date) {
      return res
        .status(400)
        .json({ error: "Missing required parameters: stocksTicker or date" });
    }

    // Call the Polygon.io API to get the open-close data
    const response = await rest.stocks.dailyOpenClose(
      stocksTicker as string,
      date as string
    );

    // Check if the response is valid
    if (!response || response.status !== "OK") {
      return res
        .status(404)
        .json({ error: `Data not found for ${stocksTicker} on ${date}` });
    }

    // Return the response in the expected format
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

    return res.status(200).json({
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
    });
  } catch (error: any) {
    console.error("Error fetching open-close data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
