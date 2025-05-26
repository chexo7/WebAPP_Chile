"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/utils/DataContext';
import { getWeekNumber, getMondayOfWeek, addWeeks, addMonths, getDaysInMonth } from '@/utils/calculationUtils'; // Assuming these are in calculationUtils

interface PeriodNavigatorProps {
  onPeriodChange: (startDate: Date, endDate: Date, periodKey: string) => void;
  initialAnalysisStartDate: string; // YYYY-MM-DD
  analysisPeriodicity: 'mensual' | 'semanal' | 'diario'; // Add 'diario' if needed
}

const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({ 
  onPeriodChange, 
  initialAnalysisStartDate,
  analysisPeriodicity 
}) => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  // Initialize state based on analysis_start_date
  useEffect(() => {
    if (initialAnalysisStartDate) {
      const startDate = new Date(initialAnalysisStartDate + 'T00:00:00');
      setCurrentYear(startDate.getFullYear());
      setCurrentMonth(startDate.getMonth());
      if (analysisPeriodicity === 'semanal') {
        setCurrentWeek(getWeekNumber(startDate));
      }
    }
  }, [initialAnalysisStartDate, analysisPeriodicity]);

  // Calculate and propagate period change
  const propagatePeriod = useCallback(() => {
    let startDate: Date;
    let endDate: Date;
    let periodKeyPart: string;

    if (analysisPeriodicity === 'mensual') {
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth + 1));
      periodKeyPart = `${currentMonth + 1}`.padStart(2, '0'); // Month number (1-12)
    } else if (analysisPeriodicity === 'semanal') {
      // Calculate Monday of the current week
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const daysOffset = (currentWeek - 1) * 7;
      let approxDateForWeek = addWeeks(firstDayOfYear, currentWeek -1); // Date within the target week
      
      // Ensure we get the Monday of that week, even if year changes due to week definition
      // This logic might need refinement for edge cases around year start/end for ISO weeks
      // For simplicity, we'll use a date in the week and find its Monday
      let tempDate = new Date(currentYear, 0, 1); // Start of the year
      tempDate.setDate(tempDate.getDate() + (currentWeek - 1) * 7); // Go to a day in that week

      startDate = getMondayOfWeek(tempDate);
       // Adjust year if the Monday falls in a different year (e.g., week 1 of 2024 might start in Dec 2023)
      if (startDate.getFullYear() !== currentYear && currentWeek === 1 && startDate.getMonth() === 11) {
          // If it's week 1 but Monday is in Dec of previous year, stick to currentYear for display consistency
          // This means the "week 1" of currentYear might show dates from previous year.
          // Or, adjust currentYear based on startDate.getFullYear() - this needs careful thought on UX.
          // For now, let's assume the week number is paramount for the selected year.
      } else if (startDate.getFullYear() !== currentYear && currentWeek > 50 && startDate.getMonth() === 0) {
          // If it's e.g. week 52/53 but Monday is in Jan of next year
      }
      // Ensure the start date's year is the one selected if it makes sense.
      // This can be tricky with ISO weeks. For now, we derive year from the week's Monday.
      // setCurrentYear(startDate.getFullYear()); // This might cause feedback loop if not handled carefully

      endDate = addWeeks(startDate, 1);
      endDate.setDate(endDate.getDate() - 1); // Sunday of that week
      periodKeyPart = `W${currentWeek.toString().padStart(2, '0')}`;
    } else { // 'diario' or fallback
      // For daily, onPeriodChange might need to be called differently or this component adapted.
      // Assuming monthly as a fallback if daily is not fully implemented here.
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth + 1));
      periodKeyPart = `${currentMonth + 1}`.padStart(2, '0');
    }
    onPeriodChange(startDate, endDate, periodKeyPart);
  }, [currentYear, currentMonth, currentWeek, analysisPeriodicity, onPeriodChange]);

  useEffect(() => {
    propagatePeriod();
  }, [propagatePeriod]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentWeek(parseInt(e.target.value));
  };

  const handlePrevPeriod = () => {
    if (analysisPeriodicity === 'mensual') {
      let newMonth = currentMonth - 1;
      let newYear = currentYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    } else if (analysisPeriodicity === 'semanal') {
      let newWeek = currentWeek - 1;
      let newYear = currentYear;
      if (newWeek < 1) {
        newYear--;
        // Determine max weeks in previous year (approx 52 or 53)
        // For simplicity, setting to 52. More accurate would be to calculate.
        const lastDayOfPrevYear = new Date(newYear, 11, 31);
        newWeek = getWeekNumber(lastDayOfPrevYear); // Get the last week number of the previous year
      }
      setCurrentWeek(newWeek);
      setCurrentYear(newYear);
    }
  };

  const handleNextPeriod = () => {
    if (analysisPeriodicity === 'mensual') {
      let newMonth = currentMonth + 1;
      let newYear = currentYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    } else if (analysisPeriodicity === 'semanal') {
      let newWeek = currentWeek + 1;
      let newYear = currentYear;
      const currentMaxWeeks = getWeekNumber(new Date(newYear, 11, 31)); // Max weeks in current year
      if (newWeek > currentMaxWeeks) {
        newWeek = 1;
        newYear++;
      }
      setCurrentWeek(newWeek);
      setCurrentYear(newYear);
    }
  };

  const yearOptions = [];
  const startYear = new Date(initialAnalysisStartDate || '1970-01-01').getFullYear() - 5; // Go back 5 years from analysis start
  const endYear = new Date().getFullYear() + 5; // Go forward 5 years from current
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(y);
  }

  const monthOptions = [
    { value: 0, label: 'Enero' }, { value: 1, label: 'Febrero' }, { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' }, { value: 4, label: 'Mayo' }, { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' }, { value: 7, label: 'Agosto' }, { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' }, { value: 10, label: 'Noviembre' }, { value: 11, label: 'Diciembre' },
  ];

  const weekOptions = [];
  // Calculate weeks for the selected year (can be 52 or 53)
  const weeksInYear = getWeekNumber(new Date(currentYear, 11, 31)); // Check last day of year for max week
  for (let w = 1; w <= weeksInYear; w++) {
    weekOptions.push(w);
  }

  return (
    <div className="payments-period-selector flex flex-wrap items-center justify-center gap-2 p-3 bg-gray-100 rounded-md shadow">
      <button onClick={handlePrevPeriod} className="button bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded text-sm">
        &lt; Anterior
      </button>
      
      <select value={currentYear} onChange={handleYearChange} className="p-2 border border-gray-300 rounded-md shadow-sm text-sm">
        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {analysisPeriodicity === 'mensual' && (
        <select value={currentMonth} onChange={handleMonthChange} className="p-2 border border-gray-300 rounded-md shadow-sm text-sm">
          {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      )}

      {analysisPeriodicity === 'semanal' && (
        <select value={currentWeek} onChange={handleWeekChange} className="p-2 border border-gray-300 rounded-md shadow-sm text-sm">
          {weekOptions.map(w => <option key={w} value={w}>Semana {w}</option>)}
        </select>
      )}
      
      <button onClick={handleNextPeriod} className="button bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded text-sm">
        Siguiente &gt;
      </button>
    </div>
  );
};

export default PeriodNavigator;
