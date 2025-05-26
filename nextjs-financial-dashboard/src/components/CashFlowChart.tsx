"use client";

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Using auto import for Chart.js v3+
import { CashFlowData } from '@/utils/calculationUtils';
import { formatDynamicCurrency } from '@/utils/formatters'; // For tooltips
import { useData } from '@/utils/DataContext';

interface CashFlowChartProps {
  cashFlowData: CashFlowData | null;
  analysisPeriodicity: 'mensual' | 'semanal' | 'diario'; // To format labels correctly
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ cashFlowData, analysisPeriodicity }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { currentBackupData } = useData();
  const displaySymbol = currentBackupData?.settings?.display_currency_symbol || '$';

  useEffect(() => {
    if (!chartRef.current || !cashFlowData) {
      return;
    }

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p } = cashFlowData;

    const totalExpenses_p = fixed_exp_p.map((val, index) => val + (var_exp_p[index] || 0));

    const formatLabelDate = (date: Date): string => {
      if (analysisPeriodicity === 'mensual') {
        return date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric', timeZone: 'UTC' });
      } else if (analysisPeriodicity === 'semanal') {
        const year = date.getUTCFullYear();
        // getWeekNumber is 1-indexed, use directly
        const weekNum = Chart.helpers.instanceof(date) ? Chart.helpers.getWeek(date) : getWeekNumber(date); 
        return `Sem ${weekNum} '${year.toString().slice(-2)}`;
      }
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' });
    };
    
    const labels = periodDates.map(date => formatLabelDate(date));

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar', // Original had lines and scatters, let's start with bar and combine
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'Saldo Final Estimado',
            data: end_bal_p,
            borderColor: 'rgba(54, 162, 235, 1)', // Blue
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            tension: 0.1,
            yAxisID: 'y',
            order: 1, // Ensure line is drawn on top
          },
          {
            type: 'bar',
            label: 'Ingreso Total Neto',
            data: income_p,
            backgroundColor: 'rgba(75, 192, 192, 0.7)', // Green
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'bar',
            label: 'Gasto Total',
            data: totalExpenses_p, // Values are positive
            backgroundColor: 'rgba(255, 99, 132, 0.7)', // Red
            yAxisID: 'y',
            order: 3,
          },
          {
            type: 'bar', // Or 'scatter' if preferred for net flow, but bar might be clearer with others
            label: 'Flujo Neto del Período',
            data: net_flow_p,
            backgroundColor: 'rgba(255, 206, 86, 0.7)', // Yellow
            yAxisID: 'y1', // Use a secondary axis if scales are very different
            order: 4,
             hidden: true, // Often less primary, can be toggled
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Período',
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: `Monto (${displaySymbol})`,
            },
            ticks: {
              callback: function (value) {
                return formatDynamicCurrency(typeof value === 'number' ? value : parseFloat(value as string), displaySymbol);
              },
            },
          },
          y1: { // Secondary axis for Net Flow if needed
            type: 'linear',
            display: true, 
            position: 'right',
            title: {
              display: true,
              text: `Flujo Neto (${displaySymbol})`,
            },
            ticks: {
              callback: function (value) {
                 return formatDynamicCurrency(typeof value === 'number' ? value : parseFloat(value as string), displaySymbol);
              },
            },
            grid: {
              drawOnChartArea: false, // Only draw grid for primary y-axis
            },
             suggestedMin: 0, // Helps if net flow is mostly positive
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += formatDynamicCurrency(context.parsed.y, displaySymbol);
                }
                return label;
              },
            },
          },
          legend: {
            position: 'top',
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [cashFlowData, analysisPeriodicity, displaySymbol]); // Re-run effect if data or settings change

  if (!cashFlowData) {
    return <p id="chart-message" className="text-center text-gray-500 py-10">No hay datos disponibles para graficar. Ajuste la configuración o cargue datos.</p>;
  }
  
  // Helper for getWeekNumber if Chart.js helpers are not available or suitable
  const getWeekNumber = (date: Date | string): number => {
    const d = new Date(Date.UTC(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
    return weekNo;
  };


  return (
    <div className="chart-container relative h-[400px] md:h-[500px] w-full p-4 border border-gray-300 rounded-lg shadow-md bg-white">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default CashFlowChart;
