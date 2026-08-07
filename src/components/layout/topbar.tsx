'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NotificacaoItem {
  id: string;
  tipo: 'danger' | 'warning' | 'info' | 'success';
  titulo: string;
  mensagem: string;
  link: string;
  tempo: string;
}

export function Topbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Alertas
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [activeTab, setActiveTab] = useState<'todas' | 'criticas' | 'avisos'>('todas');
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const userName = session?.user?.name || 'Coordenador SENAI';
  const userPerfil = (session?.user as any)?.perfil || 'COORDENADOR';

  // Buscar notificações em tempo real
  const fetchNotificacoes = async () => {
    try {
      setLoadingNotifs(true);
      const res = await fetch('/api/notificacoes');
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data.notificacoes || []);
        setTotalPendentes(data.totalPendentes || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    // Atualização suave a cada 30 segundos
    const interval = setInterval(fetchNotificacoes, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setTotalPendentes(0);
  };

  const filteredNotificacoes = notificacoes.filter((n) => {
    if (activeTab === 'criticas') return n.tipo === 'danger';
    if (activeTab === 'avisos') return n.tipo === 'warning' || n.tipo === 'info';
    return true;
  });

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

        {/* Central de Notificações Interativa */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              fetchNotificacoes();
            }}
            className="relative rounded-full p-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Notificações e Alertas"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />

            {/* Badge de Alertas com Pulso Suave */}
            {totalPendentes > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e30613] text-[9px] font-extrabold text-white shadow-xs animate-pulse">
                {totalPendentes > 9 ? '9+' : totalPendentes}
              </span>
            )}
          </button>

          {/* Popover de Notificações de Alta Fidelidade */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 z-50 overflow-hidden">
              
              {/* Header do Popover */}
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-[#e30613]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 dark:text-neutral-100">
                      Central de Alertas & Notificações
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {totalPendentes} pendência(s) ativa(s) na unidade
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-[#e30613] hover:underline flex items-center gap-0.5"
                  title="Marcar todas como visualizadas"
                >
                  <Check className="w-3 h-3" /> Limpar
                </button>
              </div>

              {/* Abas de Severidade */}
              <div className="grid grid-cols-3 border-b border-gray-100 dark:border-neutral-800 text-[11px] font-semibold text-center bg-white dark:bg-neutral-900">
                <button
                  onClick={() => setActiveTab('todas')}
                  className={`py-2 border-b-2 transition-colors ${
                    activeTab === 'todas'
                      ? 'border-[#e30613] text-[#e30613] font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Todas ({notificacoes.length})
                </button>
                <button
                  onClick={() => setActiveTab('criticas')}
                  className={`py-2 border-b-2 transition-colors ${
                    activeTab === 'criticas'
                      ? 'border-red-600 text-red-600 font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Críticas ({notificacoes.filter((n) => n.tipo === 'danger').length})
                </button>
                <button
                  onClick={() => setActiveTab('avisos')}
                  className={`py-2 border-b-2 transition-colors ${
                    activeTab === 'avisos'
                      ? 'border-amber-600 text-amber-600 font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Avisos ({notificacoes.filter((n) => n.tipo === 'warning' || n.tipo === 'info').length})
                </button>
              </div>

              {/* Lista de Alertas */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800 text-xs">
                {filteredNotificacoes.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                    <p className="font-bold text-gray-700 dark:text-neutral-300 text-xs">Tudo em dia!</p>
                    <p className="text-[11px]">Nenhum alerta pendente para esta categoria.</p>
                  </div>
                ) : (
                  filteredNotificacoes.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 block hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {n.tipo === 'danger' && <XCircle className="w-4 h-4 text-red-600" />}
                          {n.tipo === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.tipo === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-gray-900 dark:text-neutral-100 truncate text-xs group-hover:text-[#e30613] transition-colors">
                              {n.titulo}
                            </span>
                            <span className="text-[9px] font-semibold text-gray-400 shrink-0">
                              {n.tempo}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.mensagem}
                          </p>

                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e30613] mt-1.5 group-hover:underline">
                            Resolver agora <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Rodapé do Popover */}
              <div className="p-2.5 border-t border-gray-100 dark:border-neutral-800 text-center bg-gray-50/50 dark:bg-neutral-800/40">
                <Link
                  href="/atribuicoes"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-gray-700 dark:text-neutral-300 hover:text-[#e30613] transition-colors"
                >
                  Abrir Matriz de Atribuição & Grade →
                </Link>
              </div>

            </div>
          )}
        </div>
        
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
