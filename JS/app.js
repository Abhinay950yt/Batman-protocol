// Main App Logic

let currentData = loadData();

// Screen switching
function switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    document.getElementById(screenName).classList.add('active');
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
    
    // Load screen data
    if (screenName === 'dashboard') loadDashboard();
    if (screenName === 'checklist') loadChecklist();
    if (screenName === 'goals') loadGoals();
    if (screenName === 'habits') loadHabits();
    if (screenName === 'journal') loadJournal();
    if (screenName === 'analytics') loadAnalytics();
    if (screenName === 'settings') loadSettings();
}

// ==================== DASHBOARD ====================
function loadDashboard() {
    const data = loadData();
    
    // Update greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    document.getElementById('greetingMsg').textContent = `${greeting}! Let's conquer today.`;
    document.getElementById('userName').textContent = data.profile.name;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
    });
    
    // Update stats
    const todayTasks = getTodayTasks();
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const progress = todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0;
    
    document.getElementById('todayProgress').textContent = progress + '%';
    document.getElementById('tasksCompleted').textContent = `${completedTasks}/${todayTasks.length}`;
    document.getElementById('dailyStreak').textContent = `${getStreak()} 🔥`;
    document.getElementById('streakDisplay').textContent = `${getStreak()} days`;
    
    // Update progress circle
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Update missions
    Object.keys(data.missions).forEach(key => {
        const mission = data.missions[key];
        const progressEl = document.getElementById(key + 'Progress');
        const goalEl = document.getElementById(key + 'Goal');
        
        if (progressEl) {
            progressEl.style.width = mission.progress + '%';
        }
        if (goalEl) {
            goalEl.textContent = mission.title || 'Not set';
        }
    });
    
    // Show upcoming tasks
    const upcomingTasksHtml = todayTasks.slice(0, 3).map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="hidden" class="task-id" value="${task.id}">
            <div class="task-checkbox"></div>
            <div class="task-info">
                <div class="task-name">${task.title}</div>
                <div class="task-details">
                    <span>${task.duration}m</span>
                    <span class="task-badge">${task.category}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('upcomingTasks').innerHTML = upcomingTasksHtml || '<p class="empty-state">No tasks for today</p>';
}

// ==================== CHECKLIST ====================
function loadChecklist() {
    const todayTasks = getTodayTasks();
    
    const tasksHtml = todayTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="hidden" class="task-id" value="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
            <div class="task-checkbox"></div>
            <div class="task-info">
                <div class="task-name">${task.title}</div>
                <div class="task-details">
                    <span>⏱️ ${task.duration}m</span>
                    <span class="task-badge">${task.category}</span>
                    <span>📅 ${task.frequency}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon" onclick="deleteTask('${task.id}'); loadChecklist();">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('tasksList').innerHTML = tasksHtml || '<p class="empty-state">No tasks for today</p>';
}

function toggleTask(taskId) {
    const task = currentData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData(currentData);
        loadChecklist();
        loadDashboard();
    }
}

// ==================== GOALS ====================
function loadGoals() {
    const data = loadData();
    
    Object.keys(data.missions).forEach(type => {
        const mission = data.missions[type];
        const titleEl = document.getElementById(type + 'GoalText');
        const progressEl = document.getElementById(type + 'GoalProgress');
        const percentEl = document.getElementById(type + 'GoalPercent');
        const targetEl = document.getElementById(type + 'Target');
        const deadlineEl = document.getElementById(type + 'Deadline');
        
        if (titleEl) titleEl.textContent = mission.title || 'Not set';
        if (progressEl) progressEl.style.width = mission.progress + '%';
        if (percentEl) percentEl.textContent = mission.progress + '%';
        if (targetEl) targetEl.textContent = mission.target || '-';
        if (deadlineEl) deadlineEl.textContent = mission.deadline || '-';
    });
}

// ==================== HABITS ====================
function loadHabits() {
    const data = loadData();
    const habitsHtml = data.habits.map(habit => {
        const week = getWeekDays();
        const completions = Object.keys(habit.completions || {});
        
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4>${habit.name}</h4>
                    <button class="btn-icon" onclick="deleteHabit('${habit.id}'); loadHabits();">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    ${week.map(day => `
                        <div style="text-align: center;">
                            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 5px;">
                                ${day.format('ddd').substring(0, 1)}
                            </div>
                            <div style="width: 40px; height: 40px; border-radius: 6px; background: ${completions.includes(day.toDateString()) ? 'var(--primary)' : 'var(--border)'}; display: flex; align-items: center; justify-content: center; color: var(--text); font-weight: 600;">
                                ${completions.includes(day.toDateString()) ? '✓' : '-'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('habitsList').innerHTML = habitsHtml || '<p class="empty-state">No habits yet</p>';
}

function getWeekDays() {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    return days;
}

// ==================== JOURNAL ====================
function loadJournal() {
    const data = loadData();
    
    // Load past entries
    const entriesHtml = data.journal.reverse().map(entry => `
        <div style="padding: 15px; background: var(--dark); border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>${new Date(entry.date).toLocaleDateString()}</strong>
                <span>${'⭐'.repeat(entry.rating || 0)}</span>
            </div>
            <p style="margin-top: 10px; color: var(--text-secondary); font-size: 14px;">
                ${entry.accomplishment || '-'}
            </p>
            <button class="btn-icon" onclick="deleteEntry('${entry.id}'); loadJournal();" style="margin-top: 10px;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    document.getElementById('pastEntries').innerHTML = entriesHtml || '<p class="empty-state">No entries yet</p>';
    
    // Setup form
    document.getElementById('journalForm').onsubmit = (e) => {
        e.preventDefault();
        const entry = {
            accomplishment: document.getElementById('accomplishment').value,
            challenges: document.getElementById('challenges').value,
            improvement: document.getElementById('improvement').value,
            rating: parseInt(document.getElementById('rating').value)
        };
        addJournalEntry(entry);
        document.getElementById('journalForm').reset();
        loadJournal();
        loadDashboard();
    };
}

// ==================== ANALYTICS ====================
function loadAnalytics() {
    const data = loadData();
    const todayTasks = getTodayTasks();
    
    document.getElementById('analyticsTasksToday').textContent = todayTasks.length;
    document.getElementById('analyticsStreak').textContent = `${getStreak()} 🔥`;
    
    // Chart
    const ctx = document.getElementById('weeklyChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [8, 9, 7, 10, 9, 8, 7],
                    backgroundColor: 'var(--primary)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'var(--text)' } }
                },
                scales: {
                    y: {
                        ticks: { color: 'var(--text)' },
                        grid: { color: 'var(--border)' }
                    },
                    x: {
                        ticks: { color: 'var(--text)' },
                        grid: { color: 'var(--border)' }
                    }
                }
            }
        });
    }
}

// ==================== SETTINGS ====================
function loadSettings() {
    const data = loadData();
    
    document.getElementById('settingName').value = data.profile.name;
    document.getElementById('settingAge').value = data.profile.age;
    document.getElementById('settingEmail').value = data.profile.email;
    document.getElementById('wakeUpTime').value = data.settings.wakeUpTime;
    document.getElementById('sleepTime').value = data.settings.sleepTime;
    document.getElementById('workoutTime').value = data.settings.workoutTime;
    document.getElementById('notifMorning').checked = data.settings.notifications.morning;
    document.getElementById('notifWorkout').checked = data.settings.notifications.workout;
    document.getElementById('notifEvening').checked = data.settings.notifications.evening;
    document.getElementById('darkMode').checked = data.settings.appearance.darkMode;
    
    // Save profile
    document.getElementById('profileForm').onsubmit = (e) => {
        e.preventDefault();
        data.profile.name = document.getElementById('settingName').value;
        data.profile.age = parseInt(document.getElementById('settingAge').value);
        data.profile.email = document.getElementById('settingEmail').value;
        saveData(data);
        showNotification('Profile saved!');
    };
    
    // Save times
    document.getElementById('timeForm').onsubmit = (e) => {
        e.preventDefault();
        data.settings.wakeUpTime = document.getElementById('wakeUpTime').value;
        data.settings.sleepTime = document.getElementById('sleepTime').value;
        data.settings.workoutTime = document.getElementById('workoutTime').value;
        saveData(data);
        showNotification('Times saved!');
    };
}

// ==================== MODALS ====================
function openAddTaskModal() {
    document.getElementById('addTaskModal').classList.add('active');
}

function openGoalModal() {
    document.getElementById('goalModal').classList.add('active');
}

function openHabitModal() {
    document.getElementById('habitModal').classList.add('active');
}

function openJournalModal() {
    document.getElementById('journalModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function editGoal(type) {
    document.getElementById('goalType').value = type;
    document.getElementById('goalModalTitle').textContent = `Set Your ${type.charAt(0).toUpperCase() + type.slice(1)} Goal`;
    const data = loadData();
    const goal = data.missions[type];
    document.getElementById('goalDescription').value = goal.title;
    document.getElementById('goalTarget').value = goal.target;
    document.getElementById('goalDeadline').value = goal.deadline;
    document.getElementById('goalProgress').value = goal.progress;
    openGoalModal();
}

// ==================== FORM HANDLERS ====================
document.getElementById('addTaskForm').onsubmit = (e) => {
    e.preventDefault();
    const task = {
        title: document.getElementById('taskName').value,
        category: document.getElementById('taskCategory').value,
        duration: parseInt(document.getElementById('taskDuration').value),
        frequency: document.getElementById('taskFrequency').value
    };
    addTask(task);
    closeModal('addTaskModal');
    document.getElementById('addTaskForm').reset();
    loadChecklist();
    loadDashboard();
    showNotification('Task added!');
};

document.getElementById('goalForm').onsubmit = (e) => {
    e.preventDefault();
    const data = loadData();
    const type = document.getElementById('goalType').value;
    data.missions[type] = {
        title: document.getElementById('goalDescription').value,
        target: document.getElementById('goalTarget').value,
        deadline: document.getElementById('goalDeadline').value,
        progress: parseInt(document.getElementById('goalProgress').value)
    };
    saveData(data);
    closeModal('goalModal');
    loadGoals();
    loadDashboard();
    showNotification('Goal saved!');
};

document.getElementById('habitForm').onsubmit = (e) => {
    e.preventDefault();
    const habit = {
        name: document.getElementById('habitName').value,
        frequency: document.getElementById('habitFrequency').value,
        target: parseInt(document.getElementById('habitTarget').value)
    };
    addHabit(habit);
    closeModal('habitModal');
    document.getElementById('habitForm').reset();
    loadHabits();
    showNotification('Habit added!');
};

// ==================== UTILITIES ====================
function getNewQuote() {
    const quotes = [
        "Speak less. Think more. Act decisively.",
        "Power is not the will to dominate, but the capacity to improve.",
        "It's not about what you have, it's about what you do with it.",
        "Failure is not final. Giving up is.",
        "Every discipline requires sacrifice.",
        "Success is the result of discipline and focus.",
        "Your body is your temple. Treat it with respect."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationQuote').textContent = `"${randomQuote}"`;
}

function updateRating() {
    const rating = document.getElementById('rating').value;
    document.getElementById('ratingDisplay').textContent = rating;
}

function deleteHabit(habitId) {
    const data = loadData();
    data.habits = data.habits.filter(h => h.id !== habitId);
    saveData(data);
}

function deleteEntry(entryId) {
    const data = loadData();
    data.journal = data.journal.filter(e => e.id !== entryId);
    saveData(data);
}

// ==================== NAVIGATION ====================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const screen = item.getAttribute('data-screen');
        switchScreen(screen);
    });
});

// Close modal on click outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// Initialize
window.addEventListener('load', () => {
    currentData = loadData();
    switchScreen('dashboard');
    getNewQuote();
});