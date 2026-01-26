import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Görkem Karyol",
    description: "Görkem Karyol's personal portfolio site",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
        <body
            className={`${inter.className} relative min-h-screen`}
        >
            <div className="fixed inset-0 z-[-1]">
                <Image
                    src="/background.jpg"
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                    priority
                />
                
            </div>
            {children}
        </body>
        </html>
    );
}
