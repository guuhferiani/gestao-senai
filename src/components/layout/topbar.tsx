'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || 'Coordenador SENAI';
  const userPerfil = (session?.user as any)?.perfil || 'COORDENADOR';

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-6 shadow-xs transition-colors">
      
      {/* Título Principal Compacto e Responsivo */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 pr-2">
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight truncate">
          Gestão de Docentes
        </h1>
        <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-[#e30613] tracking-wide">
          SENAI SP
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Alternador de Tema */}
        <ModeToggle />

        {/* Notificações */}
        <button 
          className="rounded-full p-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        
        {/* Menu do Avatar do Usuário */}
        <div className="relative border-l border-gray-200 dark:border-neutral-800 pl-2.5 sm:pl-4" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 sm:gap-3 focus:outline-none cursor-pointer group"
          >
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                BEM-VINDO,
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 group-hover:text-[#e30613] transition-colors truncate max-w-[140px]">
                {userName}
              </span>
            </div>

            {/* Avatar Circular */}
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#e30613] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs group-hover:ring-2 group-hover:ring-red-400 transition-all">
              {userName.charAt(0).toUpperCase()}
            </div>

            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-neutral-300 transition-transform duration-200" />
          </button>

          {/* Menu Dropdown de Perfil */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 truncate">{userName}</p>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 uppercase font-semibold tracking-wider mt-0.5">
                  Perfil: {userPerfil}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Encerrar Sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
