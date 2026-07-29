import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { Users, Home, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 font-sans transition-colors duration-500 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-colors duration-500 shadow-sm z-20">
        <div className="h-16 flex items-center bg-[#E52229] px-6">
          <Image src="/senai-logo.svg" alt="SENAI" width={100} height={35} className="w-auto h-7" priority />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors group font-medium">
            <Home className="w-5 h-5 text-neutral-400 group-hover:text-[#E52229] transition-colors" />
            <span>Início</span>
          </Link>
          <Link href="/dashboard/usuarios/novo" className="flex items-center gap-3 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors group font-medium">
            <Users className="w-5 h-5 text-neutral-400 group-hover:text-[#E52229] transition-colors" />
            <span>Cadastrar Usuário</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors group font-medium">
            <Settings className="w-5 h-5 text-neutral-400 group-hover:text-[#E52229] transition-colors" />
            <span>Configurações</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors group font-medium">
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm flex items-center justify-between px-8 z-10 transition-colors duration-500">
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Painel de Gestão</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-300">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
