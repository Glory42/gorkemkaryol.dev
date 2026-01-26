"use client";

import { useState, useEffect } from "react";
import { ReadingState } from "@/types/literal";
import Image from "next/image";
import AnimatedElement from "./AnimatedContainer";
import { isApiError } from "@/types/guards";

export default function BooksClient() {
    const [books, setBooks] = useState<ReadingState[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBooks() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch("/api/books", {
            signal: controller.signal,
            headers: {
                Accept: "application/json",
            },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
            throw new Error(`Failed to fetch books: ${response.status}`);
            }

            const data = await response.json();

            if (isApiError(data) && !data.books) {
            throw new Error(data.error);
            }

            setBooks(data.books || data || []);
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
            setError("Request timed out");
            } else {
            setError(err instanceof Error ? err.message : "Unknown error");
            }
            console.error("Error fetching books:", err);
        } finally {
            setLoading(false);
        }
        }

        fetchBooks();
    }, []);

    if (loading) {
        return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="aspect-2/3 w-full bg-neutral-800 rounded-lg"></div>
                <div className="mt-3 h-4 bg-neutral-700 rounded w-3/4 mx-auto"></div>
            </div>
            ))}
        </div>
        );
    }

    if (error) {
        return (
        <p className="text-neutral-500 italic">
            Unable to load reading data. Please try again later.
        </p>
        );
    }

    if (books.length === 0) {
        return (
        <p className="text-neutral-500 italic">
            Not reading anything right now...
        </p>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((state) => (
            <AnimatedElement key={state.book.id} className="group relative">
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                <Image
                src={state.book.cover}
                alt={state.book.title}
                fill
                priority={true}
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23171717'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='sans-serif' font-size='14'%3ENo Cover%3C/text%3E%3C/svg%3E`;
                }}
                />
            </div>

            <div className="mt-3 text-center">
                <h3 className="text-sm font-medium text-white truncate px-1">
                {state.book.title}
                </h3>
                <p className="text-xs text-neutral-500">
                {state.book.authors[0]?.name}
                </p>
            </div>
            </AnimatedElement>
        ))}
        </div>
    );
}
