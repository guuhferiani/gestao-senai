'use client';

import { Bell } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession } from 'next-auth/react';

export function Topbar() {
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Usuário Gestão';
  const userPerfil = (session?.user as any)?.perfil || 'SENAI';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 shadow-sm transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-medium text-gray-800 dark:text-neutral-100">
          Gestão de Docentes
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />

        <button className="rounded-full p-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-neutral-800 pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">
              {userName}
            </span>
            <span className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
              {userPerfil}
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-[#D31900] font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
