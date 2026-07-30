import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, Clock, CalendarCheck, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">Painel Gerencial</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Acompanhe os indicadores de ocupação, carga horária e distribuição de turmas.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-gray-200 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 dark:text-neutral-300">Taxa de Ocupação</CardTitle>
            <Users className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-800 dark:text-white">78%</div>
            <p className="text-xs text-green-600 font-semibold mt-1">Nível adequado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 dark:text-neutral-300">Horas Programadas</CardTitle>
            <Clock className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-800 dark:text-white">1.240<span className="text-lg text-gray-400 font-medium">/h</span></div>
            <p className="text-xs text-gray-500 mt-1">450h livres disponíveis</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 dark:text-neutral-300">Turmas Atendidas</CardTitle>
            <CalendarCheck className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-800 dark:text-white">42</div>
            <p className="text-xs text-gray-500 mt-1">+3 iniciarão nesta semana</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-gray-600 dark:text-neutral-300">UCs em Andamento</CardTitle>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gray-800 dark:text-white">18</div>
            <p className="text-xs text-gray-500 mt-1">Distribuídas em 5 áreas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Ocupação Visual (Farol) */}
        <Card className="col-span-2 shadow-sm border-gray-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Capacidade e Ocupação (Farol)</CardTitle>
            <CardDescription>Visão geral da alocação de docentes por nível de ocupação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-neutral-300">Ocupação Saudável (Verde - Até 80%)</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">65% dos Docentes</span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-neutral-300">Ocupação de Atenção (Amarelo - 81% a 95%)</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">25% dos Docentes</span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-neutral-300">Ocupação Crítica (Vermelho - Acima de 95%)</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">10% dos Docentes</span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF0000]" style={{ width: '10%' }}></div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Alertas e Conflitos */}
        <Card className="col-span-1 shadow-sm border-gray-200 dark:border-neutral-800 bg-[#FFF5F5] dark:bg-[#3B1515]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#FF0000] dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Controle de Conflitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-md shadow-sm border border-red-100 dark:border-red-900">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">João Silva - Conflito de Horário</p>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Turma A (Manhã) e Turma B (Manhã) na mesma Quinta-feira.</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-md shadow-sm border border-red-100 dark:border-red-900">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Maria Souza - Sobrecarga</p>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Alocada 42h na semana atual. Limite é 40h.</p>
            </div>
            
            <button className="w-full text-center text-sm font-bold text-[#FF0000] mt-2 hover:underline">
              Ver todos os alertas
            </button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
