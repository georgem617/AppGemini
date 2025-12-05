import { CheckCircle2, Briefcase, CalendarDays } from 'lucide-react';
import Badge from './ui/Badge';

export default function TaskCard({ task, onTaskClick, onStatusToggle }) {
    const completedSub = task.subtasks?.filter(s => s.completed).length || 0;
    const totalSub = task.subtasks?.length || 0;
    const percent = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

    return (
        <div
            onClick={() => onTaskClick(task)}
            className="bg-zinc-900 border border-zinc-800 p-3 rounded mb-2 cursor-pointer hover:border-zinc-600 group"
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStatusToggle(task.id, task.status === 'done' ? 'backlog' : 'done');
                        }}
                        className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-black'
                                : 'border-zinc-600'
                            }`}
                    >
                        {task.status === 'done' && <CheckCircle2 size={12} />}
                    </button>
                    <div>
                        <span className={`text-sm ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {task.title}
                        </span>
                        <div className="flex gap-2 mt-1">
                            {task.projectName && (
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                    <Briefcase size={10} /> {task.projectName}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                                    <CalendarDays size={10} /> {task.dueDate}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Badge color={task.priority === 'alta' ? 'red' : 'gray'}>
                    {task.priority}
                </Badge>
            </div>
            {totalSub > 0 && (
                <div className="mt-2 flex items-center gap-2 pl-7">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-[10px] text-zinc-500">{completedSub}/{totalSub}</span>
                </div>
            )}
        </div>
    );
}
