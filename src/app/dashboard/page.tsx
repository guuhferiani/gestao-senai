export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">Visão Geral</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Bem-vindo ao sistema de Gestão Docente do SENAI.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards to make it look premium */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <h3 className="font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Total de Professores</h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">124</p>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <h3 className="font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Turmas Ativas</h3>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">42</p>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
          <h3 className="font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Pendências</h3>
          <p className="text-3xl font-bold text-[#E52229]">3</p>
        </div>
      </div>
    </div>
  );
}
