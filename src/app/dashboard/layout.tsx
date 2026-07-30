import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";
import { LayoutDashboard, GraduationCap, PlusCircle, BookOpen, Users, UserCog, Settings, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Collapsible Sidebar */}
      <aside className="w-[72px] hover:w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col transition-all duration-300 shadow-sm z-30 group overflow-hidden absolute h-full md:relative">
        
        {/* Logo Area */}
        <div className="h-16 bg-[#FF0000] flex items-center px-[22px] flex-shrink-0 transition-all duration-300 overflow-hidden relative">
          <div className="flex items-center gap-4 whitespace-nowrap">
            {/* S Icon (Collapsed state) */}
            <span className="text-white font-black italic text-3xl tracking-widest block group-hover:hidden">S</span>
            
            {/* Full Logo (Expanded state) */}
            <div className="hidden group-hover:block w-32 transition-opacity duration-300">
              <Image src="/senai-logo.svg" alt="SENAI" width={120} height={40} className="w-auto h-8" priority />
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
          
          <Link href="/dashboard" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Painel Gerencial</span>
          </Link>

          <Link href="/dashboard/turmas" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Turmas</span>
          </Link>
          
          <Button variant="default" className="bg-[#FF0000] hover:bg-[#CC0000] text-white h-11 px-3 mt-2 rounded-md shadow-none flex items-center justify-start gap-4 font-bold text-sm mx-1">
            <PlusCircle className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Criar Turma</span>
          </Button>

          <div className="h-px bg-gray-200 dark:bg-neutral-800 my-4 mx-2"></div>

          <Link href="/dashboard/ucs" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Gestão de UCs e Áreas</span>
          </Link>

          <Link href="/dashboard/professores" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <Users className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Gestão de Professores</span>
          </Link>

          <Link href="/dashboard/professores/perfil" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <UserCog className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Perfil dos Professores</span>
          </Link>

          <Link href="/dashboard/cadastros" className="flex items-center gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors hover:text-[#FF0000]">
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Gestão de Cadastros</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
          <button className="w-full flex items-center justify-start gap-4 px-3 py-3 text-gray-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-[#FF0000] dark:hover:text-[#FF0000] rounded-md transition-colors group/logout font-medium">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden ml-[72px] md:ml-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-8 z-20 shadow-sm transition-colors duration-300">
          
          <h2 className="text-lg font-bold text-gray-800 dark:text-neutral-100 hidden md:block">Sistema de Gestão Docente</h2>
          <div className="md:hidden"></div>

          {/* Right: User Profile & Mode Toggle */}
          <div className="flex items-center h-full gap-6">
            <ModeToggle />
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 tracking-widest uppercase">Bem-vindo,</span>
                <span className="text-sm font-bold text-[#00274B] dark:text-blue-300">Administrador Gestor</span>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                A
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          {children}
        </main>
      </div>

    </div>
  );
}
