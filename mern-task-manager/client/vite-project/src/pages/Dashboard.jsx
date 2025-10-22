import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskItem from '../components/TaskItem';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: ''
    });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchTasks();
    }, [user, navigate]);

    const clearError = () => setError('');

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/tasks');
            setTasks(res.data.data);
            clearError();
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err.response?.data?.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/tasks', formData);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: 'pending',
                dueDate: ''
            });
            setShowForm(false);
            fetchTasks();
            clearError();
        } catch (err) {
            console.error('Error creating task:', err);
            setError(err.response?.data?.message || 'Failed to create task');
        }
    };

    const handleUpdate = async (taskId, updatedData) => {
        try {
            await axios.put(`/api/tasks/${taskId}`, updatedData);
            fetchTasks();
            clearError();
        } catch (err) {
            console.error('Error updating task:', err);
            setError(err.response?.data?.message || 'Failed to update task');
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete(`/api/tasks/${taskId}`);
                fetchTasks();
                clearError();
            } catch (err) {
                console.error('Error deleting task:', err);
                setError(err.response?.data?.message || 'Failed to delete task');
            }
        }
    };

    const getTaskStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(task => task.status === 'completed').length;
        const inProgress = tasks.filter(task => task.status === 'in-progress').length;
        const pending = tasks.filter(task => task.status === 'pending').length;

        return { total, completed, inProgress, pending };
    };

    const stats = getTaskStats();

    if (loading) {
        return (
            <div className="container">
                <div className="text-center">
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>My Tasks</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? 'Cancel' : 'Add New Task'}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button
                        onClick={clearError}
                        style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Task Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '30px'
            }}>
                <div className="card text-center">
                    <h3 style={{ color: '#007bff' }}>{stats.total}</h3>
                    <p>Total Tasks</p>
                </div>
                <div className="card text-center">
                    <h3 style={{ color: '#28a745' }}>{stats.completed}</h3>
                    <p>Completed</p>
                </div>
                <div className="card text-center">
                    <h3 style={{ color: '#17a2b8' }}>{stats.inProgress}</h3>
                    <p>In Progress</p>
                </div>
                <div className="card text-center">
                    <h3 style={{ color: '#6c757d' }}>{stats.pending}</h3>
                    <p>Pending</p>
                </div>
            </div>

            {/* Add Task Form */}
            {showForm && (
                <div className="card mb-3">
                    <h3>Add New Task</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Task title"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Task description"
                                rows="3"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-control"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success">
                            Add Task
                        </button>
                    </form>
                </div>
            )}

            {/* Tasks List */}
            <div>
                {tasks.length === 0 ? (
                    <div className="card text-center">
                        <h3>No tasks found</h3>
                        <p>Get started by creating your first task!</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn btn-primary"
                        >
                            Create Your First Task
                        </button>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskItem
                            key={task._id}
                            task={task}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;