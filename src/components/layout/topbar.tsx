'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function Topbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || 'Usuário Gestão';
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 shadow-sm transition-colors">
      
      {/* Título Principal */}
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold text-gray-800 dark:text-neutral-100 tracking-tight">
          Gestão de Docentes
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Alternador de Tema */}
        <ModeToggle />

        {/* Notificações */}
        <button 
          className="rounded-full p-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
        </button>
        
        {/* Menu do Avatar do Usuário (Dropdown Referência) */}
        <div className="relative border-l border-gray-200 dark:border-neutral-800 pl-4" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 focus:outline-none cursor-pointer group"
          >
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                BEM-VINDO,
              </span>
              <span className="text-sm font-bold text-[#e30613] group-hover:underline">
                {userName}
              </span>
            </div>

            {/* Círculo do Avatar com Inicial */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e30613] text-white font-black text-sm shadow-sm transition-transform group-hover:scale-105">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* Ícone Chevron */}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-[#e30613]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#e30613]" />
            )}
          </button>

          {/* Card do Dropdown (Exatamente como a referência) */}
          {isOpen && (
            <div className="absolute right-0 top-12 mt-2 w-56 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              
              <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-neutral-800/40">
                <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">Perfil Conectado</p>
                <p className="text-xs font-bold text-gray-900 dark:text-neutral-100 uppercase tracking-wider">{userPerfil}</p>
              </div>

              {/* Meu Perfil */}
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
                <span>Meu Perfil</span>
              </Link>

              <div className="border-t border-gray-100 dark:border-neutral-800 my-1" />

              {/* Botão Sair */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-[#e30613] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-4 w-4 text-[#e30613]" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
