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

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
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
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "bg-[#F8F9FA] dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col transition-colors",
        isExpanded ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-neutral-800 bg-[#FF0000] text-white">
        <span className={cn("font-bold transition-all duration-300", isExpanded ? "text-xl opacity-100" : "text-[0px] opacity-0 overflow-hidden")}>
          SENAI
        </span>
        {!isExpanded && (
          <span className="font-bold text-lg">S</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2.5 transition-colors group",
                    isActive 
                      ? "bg-red-50 dark:bg-red-950/40 text-[#FF0000]" 
                      : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100"
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-[#FF0000]" : "text-gray-500 dark:text-neutral-400 group-hover:text-gray-700 dark:group-hover:text-neutral-200")} />
                  <span className={cn(
                    "ml-3 whitespace-nowrap transition-all duration-300",
                    isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
                  )}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 dark:border-neutral-800 p-2">
        <button
          onClick={() => { /* signOut() */ }}
          className={cn(
            "flex w-full items-center rounded-md px-3 py-2.5 text-gray-600 dark:text-neutral-400 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-neutral-100",
            !isExpanded && "justify-center"
          )}
          title="Sair"
        >
          <LogOut className="h-5 w-5 text-gray-500 dark:text-neutral-400" />
          <span className={cn(
            "ml-3 whitespace-nowrap transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
          )}>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
