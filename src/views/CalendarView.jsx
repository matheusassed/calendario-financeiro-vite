import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatFiscalMonth,
} from "../utils/helpers";

export function CalendarView({
  transactions,
  setCurrentPage,
  setSelectedDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    setCurrentPage("dayDetails");
  };

  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const fiscalMonthStr = formatFiscalMonth(
      new Date(currentYear, currentMonth, 1)
    );
    const relevantTransactions = transactions.filter(
      (t) => t.fiscalMonth === fiscalMonthStr
    );

    let cumulativeBalance = 0;
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;

      const dayTransactions = relevantTransactions.filter((t) => {
        const tDate = t.date;
        return (
          tDate.getDate() === day &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      });

      const dayRevenues = dayTransactions
        .filter((t) => t.type === "revenue")
        .reduce((sum, t) => sum + t.value, 0);

      const dayExpenses = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.value, 0);

      cumulativeBalance += dayRevenues - dayExpenses;

      return {
        day,
        revenues: dayRevenues,
        expenses: dayExpenses,
        balance: cumulativeBalance,
      };
    });

    return {
      daysInMonth,
      adjustedFirstDay,
      dailyData,
      monthName: new Date(currentYear, currentMonth).toLocaleDateString(
        "pt-BR",
        { month: "long" }
      ),
      year: currentYear,
    };
  }, [currentYear, currentMonth, transactions]);

  const blanks = Array.from({ length: monthData.adjustedFirstDay });
  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="page-content">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft />
        </button>
        <h2 className="calendar-title">{`${monthData.monthName} de ${monthData.year}`}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight />
        </button>
      </div>
      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="day-cell blank"></div>
        ))}
        {monthData.dailyData.map((data) => (
          <div
            key={data.day}
            className="day-cell"
            onClick={() => handleDayClick(data.day)}
          >
            <div className="day-number">{data.day}</div>
            <div className="day-details">
              {data.revenues > 0 && (
                <p className="day-revenue">R: {data.revenues.toFixed(2)}</p>
              )}
              {data.expenses > 0 && (
                <p className="day-expense">D: {data.expenses.toFixed(2)}</p>
              )}
              <p className="day-balance">S: {data.balance.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
