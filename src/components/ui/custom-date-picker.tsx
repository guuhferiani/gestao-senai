'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw 
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA_SIGLAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data...',
  disabled = false,
  className = '',
  id,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar estado de navegação com a data selecionada ou a data de hoje
  const parseInitialDate = () => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState<number>(parseInitialDate().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(parseInitialDate().getFullYear());

  // Atualizar mês/ano se a prop value mudar
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setCurrentMonth(Number(parts[1]) - 1);
        setCurrentYear(Number(parts[0]));
      }
    }
  }, [value]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navegar meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Obter dias do mês atual e adjacentes
  const getDaysGrid = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { day: number; monthOffset: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, monthOffset: -1, isCurrentMonth: false, dateStr });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, monthOffset: 0, isCurrentMonth: true, dateStr });
    }

    // Dias do próximo mês para completar 42 células (6 linhas)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, monthOffset: 1, isCurrentMonth: false, dateStr });
    }

    return days;
  };

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onChange(todayStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Formatar data para exibição (DD/MM/AAAA)
  const formatDisplayDate = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Botão Gatilho (Trigger do Input de Data) */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left transition-all duration-150 rounded-xl border bg-white dark:bg-neutral-900 px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-neutral-200 shadow-2xs h-10 ${
          isOpen
            ? 'border-[#e30613] ring-2 ring-red-500/20'
            : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0" />
          {value ? (
            <span className="font-semibold text-gray-900 dark:text-neutral-100 font-mono text-xs">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-neutral-500 font-normal">{placeholder}</span>
          )}
        </div>

        <CalendarIcon
          className={`w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors ${
            isOpen ? 'text-[#e30613]' : ''
          }`}
        />
      </button>

      {/* Popover do Calendário Customizado SENAI */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-72 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-100">
          
          {/* Header de Navegação Mês / Ano */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800/80 pb-3 mb-3">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-neutral-100 capitalize">
                {MESES[currentMonth]} {currentYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DIAS_SEMANA_SIGLAS.map((sigla, idx) => (
              <span
                key={sigla}
                className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
                  idx === 0 || idx === 6
                    ? 'text-gray-400 dark:text-neutral-500'
                    : 'text-gray-600 dark:text-neutral-400'
                }`}
              >
                {sigla}
              </span>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysGrid().map((cell, idx) => {
              const isSelected = cell.dateStr === value;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.dateStr)}
                  className={`h-8 w-8 text-xs font-semibold rounded-xl flex items-center justify-center transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#e30613] text-white shadow-sm font-bold scale-105'
                      : isToday
                      ? 'border border-[#e30613] text-[#e30613] font-bold hover:bg-red-50 dark:hover:bg-red-950/40'
                      : cell.isCurrentMonth
                      ? 'text-gray-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      : 'text-gray-300 dark:text-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Rodapé com Ações Rápidas (Hoje / Limpar) */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800/80 pt-3 mt-3 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpar
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[#e30613] hover:text-[#b7040f] font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Hoje
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
