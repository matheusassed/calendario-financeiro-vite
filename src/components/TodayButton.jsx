import { CalendarClock } from 'lucide-react';

export function TodayButton({ onClick }) {
  return (
    <button onClick={onClick} className="today-button" title="Voltar para hoje">
      <CalendarClock size={20} />
      <span>Hoje</span>
    </button>
  );
}
