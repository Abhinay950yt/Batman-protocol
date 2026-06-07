// Local Storage Management

const STORAGE_KEY = 'batman_protocol_data';

// Default data structure
const defaultData = {
    profile: {
        name: 'Batman',
        age: 0,
        email: '',
        joinDate: new Date().toISOString()
    },
    settings: {
        wakeUpTime: '06:00',
        sleepTime: '22:00',
        workoutTime: '18:00',
        notifications: {
            morning: true,
            workout: true,
            evening: true
        },
        appearance: {
            darkMode: true,
            animations: true
        }
    },
    missions: {
        health: { title: '', target: '', deadline: '', progress: 0 },
        wealth: { title: '', target: '', deadline: '', progress: 0 },
        main: { title: '', target: '', deadline: '', progress: 0, milestones: [] }
    },
    tasks: [],
    goals: [],
    habits: [],
    journal: [],
    dailyStats: {}
};

// Save data
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load data
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return defaultData;
}

// Initialize data
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveData(defaultData);
    }
}

// Get specific data
function getData(key) {
    const data = loadData();
    return key ? data[key] : data;
}

// Update specific data
function updateData(key, value) {
    const data = loadData();
    data[key] = value;
    saveData(data);
}

// Add task
function addTask(task) {
    const data = loadData();
    task.id = Date.now().toString();
    task.createdAt = new Date().toISOString();
    task.completed = false;
    data.tasks.push(task);
    saveData(data);
    return task;
}

// Update task
function updateTask(taskId, updates) {
    const data = loadData();
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
        Object.assign(task, updates);
        saveData(data);
    }
    return task;
}

// Delete task
function deleteTask(taskId) {
    const data = loadData();
    data.tasks = data.tasks.filter(t => t.id !== taskId);
    saveData(data);
}

// Get tasks for today
function getTodayTasks() {
    const data = loadData();
    const today = new Date().toDateString();
    return data.tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toDateString();
        return taskDate === today;
    });
}

// Add journal entry
function addJournalEntry(entry) {
    const data = loadData();
    entry.id = Date.now().toString();
    entry.date = new Date().toISOString();
    data.journal.push(entry);
    saveData(data);
    return entry;
}

// Add habit
function addHabit(habit) {
    const data = loadData();
    habit.id = Date.now().toString();
    habit.createdAt = new Date().toISOString();
    habit.completions = {};
    data.habits.push(habit);
    saveData(data);
    return habit;
}

// Mark habit as done
function completeHabit(habitId, date = new Date().toDateString()) {
    const data = loadData();
    const habit = data.habits.find(h => h.id === habitId);
    if (habit) {
        if (!habit.completions) habit.completions = {};
        habit.completions[date] = true;
        saveData(data);
    }
    return habit;
}

// Get streak
function getStreak() {
    const data = loadData();
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
        const dateStr = currentDate.toDateString();
        const todayTasks = getTodayTasks().filter(t => t.completed);
        
        if (todayTasks.length === 0) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Clear all data
function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    initializeData();
}

// Export data
function exportData() {
    const data = loadData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batman-protocol-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Import data
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            saveData(data);
            location.reload();
        } catch (error) {
            alert('Invalid file format');
        }
    };
    reader.readAsText(file);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeData);