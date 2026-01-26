import { NextResponse } from "next/server";
import { getCurrentlyReading } from "@/lib/literal";

export async function GET(): Promise<NextResponse> {
    try {
        const books = await getCurrentlyReading();

        return NextResponse.json(books, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
            "Content-Type": "application/json",
        },
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
        { error: "Failed to fetch books", books: [] },
        {
            status: 500,
            headers: {
            "Cache-Control": "no-cache",
            },
        },
        );
    }
}
