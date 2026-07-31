'use client';

import { Bell, User } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export function Topbar() {
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
              Usuário Teste
            </span>
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              Coordenador
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
