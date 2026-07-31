'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Áreas e UCs', href: '/areas', icon: BookOpen },
  { name: 'Corpo Docente', href: '/docentes', icon: Users },
  { name: 'Turmas e Ocupação', href: '/turmas', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-neutral-800 bg-[#e30613] text-white overflow-hidden transition-all duration-300">
        <span className="font-black text-xl shrink-0 w-8 text-center">S</span>
        <span 
          className={cn(
            "font-bold text-lg whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ml-1",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"
          )}
        >
          ENAI
        </span>
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
