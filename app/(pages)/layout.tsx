"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/providers/SidebarProvider';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar();

    return (
            
        <div className="min-h-screen flex relative">
        

        <Sidebar />
        
        <main 
            className={`flex-1 w-full pt-2 px-8 md:px-16 transition-all duration-300 ease-in-out ${
            isOpen ? "md:pl-64" : "pl-0"
            }`}
        >
            <div className="max-w-4xl mx-auto">
                {children}
            </div>
        </main>
        </div>
        

    );
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
}