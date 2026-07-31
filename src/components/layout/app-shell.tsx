'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';

  if (isAuthPage) {
    return (
      <main className="w-full h-screen overflow-hidden bg-[#F8F9FA] dark:bg-neutral-950">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden ml-16 transition-all duration-300">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] dark:bg-neutral-950 p-6 transition-colors">
          {children}
        </main>
      </div>
    </>
  );
}
