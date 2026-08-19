'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  CalendarDays, 
  UserCog, 
  BarChart3, 
  Sparkles, 
  LogOut 
} from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

const allMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Áreas e UCs', href: '/areas', icon: BookOpen },
  { name: 'Corpo Docente', href: '/docentes', icon: Users },
  { name: 'Turmas e Ocupação', href: '/turmas', icon: Calendar },
  { name: 'Atribuição & Grade', href: '/atribuicoes', icon: CalendarDays },
  { name: 'Simulador de Demanda', href: '/simulador', icon: Sparkles },
  { name: 'Usuários & Acessos', href: '/usuarios', icon: UserCog },
  { name: 'Relatórios & Métricas', href: '/relatorios', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  const perfil = (session?.user as any)?.perfil || 'DOCENTE';

  // Filtragem estrita dos itens do menu conforme as Regras de Negócio do SENAI
  const menuItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      // 1. Gestão de Usuários e Simulador: exclusivo para Coordenador e Secretaria
      if (item.href === '/usuarios' || item.href === '/simulador') {
        return perfil === 'COORDENADOR' || perfil === 'SECRETARIA';
      }
      // 2. Cadastro Geral de Áreas e UCs: exclusivo para Coordenador e Secretaria
      if (item.href === '/areas') {
        return perfil === 'COORDENADOR' || perfil === 'SECRETARIA';
      }
      // 3. Atribuição & Grade e Relatórios: Coordenador, Secretaria e OPP
      if (item.href === '/atribuicoes' || item.href === '/relatorios') {
        return perfil === 'COORDENADOR' || perfil === 'SECRETARIA' || perfil === 'OPP';
      }
      // 4. Dashboard, Corpo Docente (Minha Agenda) e Turmas: visível a todos
      return true;
    });
  }, [perfil]);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col",
        "bg-[#F8F9FA] dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transition-colors",
        isExpanded ? "w-64 shadow-2xl ring-1 ring-black/5 dark:ring-white/10" : "w-16 shadow-sm"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header Logo SENAI */}
      <div className="flex h-16 items-center justify-center border-b border-red-700 bg-[#e30613] px-3 overflow-hidden transition-colors">
        {isExpanded ? (
          <div className="animate-in fade-in duration-200 flex items-center justify-center w-full">
            <Image 
              src="/senai-logo-inverse.svg" 
              alt="SENAI Logo" 
              width={140} 
              height={44} 
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200 flex items-center justify-center">
            <Image 
              src="/senai-icon-inverse.svg" 
              alt="SENAI Icon" 
              width={40} 
              height={32} 
              priority
              className="h-7 w-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1.5 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 group relative",
                    isActive 
                      ? "bg-red-50 dark:bg-red-950/40 text-[#D31900] font-semibold" 
                      : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105", isActive ? "text-[#D31900]" : "text-gray-500 dark:text-neutral-400 group-hover:text-gray-700 dark:group-hover:text-neutral-200")} />
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ml-3 text-sm",
                    isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
                  )}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé / Sair */}
      <div className="border-t border-gray-200 dark:border-neutral-800 p-2">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-2.5 text-gray-600 dark:text-neutral-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100 cursor-pointer"
          )}
          title={!isExpanded ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-gray-500 dark:text-neutral-400" />
          <span className={cn(
            "whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ml-3 text-sm font-medium",
            isExpanded ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
          )}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
