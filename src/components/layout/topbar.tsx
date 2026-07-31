'use client';

import { Bell, Search, User } from 'lucide-react';
// import { useSession } from 'next-auth/react'; // Descomentar ao usar next-auth

export function Topbar() {
  // const { data: session } = useSession();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-medium text-gray-800">
          Gestão de Docentes
        </h1>
        {/* Placeholder for Breadcrumbs or Search if needed */}
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">
              {/* session?.user?.name || */ 'Usuário Teste'}
            </span>
            <span className="text-xs text-gray-500">
              {/* session?.user?.perfil || */ 'Coordenador'}
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-600">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
