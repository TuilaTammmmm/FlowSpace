import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { MOCK_API } from '../services/api';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

function CalendarView() {
  const { activeProjectId } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (activeProjectId) {
      MOCK_API.getTasksByProjectId(activeProjectId).then(data => setTasks(data));
    }
  }, [activeProjectId]);

  const nextMonth = () => setCurrentDate(addDays(currentDate, 30));
  const prevMonth = () => setCurrentDate(addDays(currentDate, -30));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayTasks = tasks.filter(t => t.deadline && isSameDay(new Date(t.deadline), cloneDay));
      
      days.push(
        <div key={day} 
          className={`p-2 border border-secondary border-opacity-10`}
          style={{ minHeight: '120px', background: isSameMonth(day, monthStart) ? 'var(--surface-1)' : 'var(--surface-2)', opacity: isSameMonth(day, monthStart) ? 1 : 0.4 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className={`fw-bold small ${isSameDay(day, new Date()) ? 'text-danger bg-danger bg-opacity-10 px-2 rounded' : 'text-secondary'}`}>
              {formattedDate}
            </span>
          </div>
          <div className="d-flex flex-column gap-1">
            {dayTasks.map(task => (
              <div key={task.id} 
                className="px-2 py-1 rounded small fw-medium text-truncate" 
                style={{ 
                  fontSize: '11px', 
                  background: task.status === 'done' ? 'rgba(16,185,129,0.2)' : task.status === 'in-progress' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                  color: task.status === 'done' ? '#10B981' : task.status === 'in-progress' ? '#F59E0B' : 'var(--text-primary)',
                  borderLeft: `2px solid ${task.status === 'done' ? '#10B981' : task.status === 'in-progress' ? '#F59E0B' : '#94A3B8'}`
                }}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="d-flex w-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} key={day}>{days}</div>);
    days = [];
  }

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Lịch làm việc</h4>
        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-sm text-secondary" style={{ background: 'var(--surface-2)' }} onClick={prevMonth}><i className="bi bi-chevron-left"></i></button>
          <span className="fw-bold mx-2">{format(currentDate, 'MMMM yyyy', { locale: vi })}</span>
          <button className="btn btn-sm text-secondary" style={{ background: 'var(--surface-2)' }} onClick={nextMonth}><i className="bi bi-chevron-right"></i></button>
        </div>
      </div>
      
      <div className="card-premium p-0 overflow-hidden shadow-premium">
        <div className="d-flex w-100 py-2" style={{ background: 'var(--surface-3)', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {weekDays.map((d, i) => <div key={i} className="text-center fw-bold small text-secondary">{d}</div>)}
        </div>
        <div>
          {rows}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
