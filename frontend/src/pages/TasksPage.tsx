import { useEffect, useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertCircle, ListChecks } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface Task {
    id: string;
    title: string;
    description: string;
    assigned_to: string;
    assigned_to_name: string;
    due_date: string;
    priority: string;
    status: string;
    created_at: string;
}

interface TaskStats {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
}

interface TaskTemplate {
    id: string;
    name: string;
    description: string;
    checklist_items: string[];
    is_active: boolean;
}

const priorityBadge = (p: string) => {
    const map: Record<string, string> = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
    return map[p] || 'badge-neutral';
};

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        pending: 'badge-warning', in_progress: 'badge-info', completed: 'badge-success', cancelled: 'badge-neutral',
    };
    return map[s] || 'badge-neutral';
};

export default function TasksPage() {
    const [activeTab, setActiveTab] = useState<'tasks' | 'templates'>('tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [templates, setTemplates] = useState<TaskTemplate[]>([]);
    const [stats, setStats] = useState<TaskStats>({ total: 0, pending: 0, in_progress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '', checklist_items: '' });
    const { selectedPropertyId } = usePropertyStore();

    const fetchTasks = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        Promise.all([
            api.get(`/maintenance/properties/${selectedPropertyId}/tasks/`),
            api.get(`/maintenance/properties/${selectedPropertyId}/tasks/stats/`),
        ])
            .then(([tasksRes, statsRes]) => {
                setTasks(tasksRes.data.results || tasksRes.data || []);
                setStats(statsRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    const fetchTemplates = () => {
        if (!selectedPropertyId) return;
        api.get(`/maintenance/properties/${selectedPropertyId}/task-templates/`)
            .then(res => setTemplates(res.data.results || res.data || []))
            .catch(() => { });
    };

    useEffect(() => {
        fetchTasks();
        fetchTemplates();
    }, [selectedPropertyId]);

    const handleAddTask = () => {
        if (!selectedPropertyId) return;
        api.post(`/maintenance/properties/${selectedPropertyId}/tasks/`, newTask)
            .then(() => {
                setShowAddForm(false);
                setNewTask({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
                fetchTasks();
            })
            .catch(() => { });
    };

    const handleCompleteTask = (id: string) => {
        if (!selectedPropertyId) return;
        api.post(`/maintenance/properties/${selectedPropertyId}/tasks/${id}/complete/`)
            .then(() => fetchTasks())
            .catch(() => { });
    };

    const handleAddTemplate = () => {
        if (!selectedPropertyId) return;
        const items = newTemplate.checklist_items.split('\n').filter(i => i.trim());
        api.post(`/maintenance/properties/${selectedPropertyId}/task-templates/`, {
            name: newTemplate.name,
            description: newTemplate.description,
            checklist_items: items,
        })
            .then(() => {
                setShowTemplateForm(false);
                setNewTemplate({ name: '', description: '', checklist_items: '' });
                fetchTemplates();
            })
            .catch(() => { });
    };

    const filteredTasks = statusFilter ? tasks.filter(t => t.status === statusFilter) : tasks;

    const tabs = [
        { key: '', label: 'All', count: stats.total },
        { key: 'pending', label: 'Pending', count: stats.pending },
        { key: 'in_progress', label: 'In Progress', count: stats.in_progress },
        { key: 'completed', label: 'Completed', count: stats.completed },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>{activeTab === 'tasks' ? 'Tasks' : 'Task Templates'}</h1>
                    <p className="subtitle">
                        {activeTab === 'tasks'
                            ? `${stats.total} tasks • ${stats.pending} pending`
                            : `${templates.length} templates`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`btn ${activeTab === 'tasks' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('tasks')}>
                        <ClipboardList size={16} /> Tasks
                    </button>
                    <button className={`btn ${activeTab === 'templates' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('templates')}>
                        <ListChecks size={16} /> Templates
                    </button>
                </div>
            </div>

            {activeTab === 'tasks' && (
                <>
                    <div className="stats-grid" style={{ marginBottom: 16 }}>
                        <div className="stat-card">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>{stats.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-info)' }}>{stats.in_progress}</div>
                            <div className="stat-label">In Progress</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{stats.completed}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        {tabs.map(t => (
                            <button key={t.key}
                                className={`btn ${statusFilter === t.key ? 'btn-primary' : ''}`}
                                onClick={() => setStatusFilter(t.key)}
                                style={{ fontSize: '0.8rem' }}>
                                {t.label} ({t.count})
                            </button>
                        ))}
                        <div style={{ flex: 1 }} />
                        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                            <Plus size={16} /> Add Task
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 12 }}>New Task</h3>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select className="form-select" value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <input className="form-input" type="date" value={newTask.due_date}
                                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Assigned To</label>
                                    <input className="form-input" value={newTask.assigned_to}
                                        onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: 8 }}>
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" rows={3} value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button className="btn btn-primary" onClick={handleAddTask}>Create Task</button>
                                <button className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="page-loading"><div className="spinner"></div></div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <ClipboardList size={48} />
                                <h3>No Tasks</h3>
                                <p>Create tasks to track property work.</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            {filteredTasks.map(t => (
                                <div className="card" key={t.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                        background: t.status === 'completed' ? 'var(--accent-success-bg)' : t.status === 'in_progress' ? 'var(--accent-info-bg)' : 'var(--accent-warning-bg)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {t.status === 'completed' ? <CheckCircle2 size={20} style={{ color: 'var(--accent-success)' }} />
                                            : t.status === 'in_progress' ? <Clock size={20} style={{ color: 'var(--accent-info)' }} />
                                                : <AlertCircle size={20} style={{ color: 'var(--accent-warning)' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <strong>{t.title}</strong>
                                            <span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span>
                                            <span className={`badge ${statusBadge(t.status)}`}>{t.status.replace('_', ' ')}</span>
                                        </div>
                                        {t.description && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{t.description}</p>
                                        )}
                                        <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                                            {t.assigned_to_name && <span>Assigned: {t.assigned_to_name}</span>}
                                            {t.due_date && <span>Due: {new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                                            <span>{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                            {t.status !== 'completed' && (
                                                <button className="btn" style={{ fontSize: '0.75rem', padding: '2px 8px', marginLeft: 'auto' }}
                                                    onClick={() => handleCompleteTask(t.id)}>
                                                    <CheckCircle2 size={12} /> Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'templates' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button className="btn btn-primary" onClick={() => setShowTemplateForm(!showTemplateForm)}>
                            <Plus size={16} /> Add Template
                        </button>
                    </div>

                    {showTemplateForm && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h3 style={{ marginBottom: 12 }}>New Template</h3>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="form-input" value={newTemplate.name}
                                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input className="form-input" value={newTemplate.description}
                                        onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: 8 }}>
                                <label className="form-label">Checklist Items (one per line)</label>
                                <textarea className="form-textarea" rows={4} value={newTemplate.checklist_items}
                                    onChange={e => setNewTemplate({ ...newTemplate, checklist_items: e.target.value })}
                                    placeholder="Check water supply&#10;Inspect electrical wiring&#10;Verify fire extinguishers" />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button className="btn btn-primary" onClick={handleAddTemplate}>Create Template</button>
                                <button className="btn" onClick={() => setShowTemplateForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {templates.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <ListChecks size={48} />
                                <h3>No Templates</h3>
                                <p>Create reusable task templates.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid-2">
                            {templates.map(t => (
                                <div className="card" key={t.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <ListChecks size={18} style={{ color: 'var(--accent-info)' }} />
                                        <strong>{t.name}</strong>
                                        <span className={`badge ${t.is_active ? 'badge-success' : 'badge-neutral'}`}>
                                            {t.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {t.description && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t.description}</p>
                                    )}
                                    {t.checklist_items && t.checklist_items.length > 0 && (
                                        <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: 18, margin: 0 }}>
                                            {t.checklist_items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
