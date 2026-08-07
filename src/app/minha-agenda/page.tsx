'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MinhaAgendaRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadMyAgenda() {
      try {
        const res = await fetch('/api/docentes/me/agenda');
        if (res.ok) {
          // A API faz o redirecionamento ou devolve os dados
          const data = await res.json();
          if (data.docente?.id) {
            router.push(`/docentes/${data.docente.id}/agenda`);
            return;
          }
        }
        // Se for redirecionamento direto do fetch
        if (res.redirected) {
          window.location.href = res.url;
          return;
        }

        // Caso não encontre nenhum docente logado, buscar o primeiro
        const resDocentes = await fetch('/api/docentes');
        if (resDocentes.ok) {
          const docs = await resDocentes.json();
          if (docs.length > 0) {
            router.push(`/docentes/${docs[0].id}/agenda`);
            return;
          }
        }
        setErrorMsg('Nenhum registro de docente ativo foi localizado.');
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao carregar agenda.');
      } finally {
        setLoading(false);
      }
    }

    loadMyAgenda();
  }, [router]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-16 text-center border border-gray-200 dark:border-neutral-800 space-y-3">
      {loading ? (
        <>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-2" />
          <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100">Carregando Minha Agenda...</h2>
          <p className="text-xs text-gray-500">Sincronizando suas aulas, horários e ambientes pedagógicos.</p>
        </>
      ) : (
        <>
          <CalendarDays className="w-10 h-10 mx-auto text-[#e30613]" />
          <h2 className="text-base font-bold text-gray-900 dark:text-neutral-100">{errorMsg || 'Agenda do Docente'}</h2>
          <Button onClick={() => router.push('/docentes')} variant="outline" className="text-xs mt-2">
            Ver Todos os Docentes
          </Button>
        </>
      )}
    </div>
  );
}
