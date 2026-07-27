import { NextRequest, NextResponse } from "next/server";

// This route runs on the server, so process.env.FINNHUB_API_KEY
// is never exposed to the browser (unlike NEXT_PUBLIC_ vars).
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Finnhub request failed" }, { status: res.status });
    }

    const data = await res.json();
    // data shape: { c: current price, d: change, dp: percent change, h: high, l: low, o: open, pc: prev close }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}
