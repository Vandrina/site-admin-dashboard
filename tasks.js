// ══════════════════════════════════════════════════════════════
// TASK MANAGER
// ══════════════════════════════════════════════════════════════

class TaskManager {
  constructor() {
    this.tasks = loadFromStorage('tasks', TASKS_DATA);
    this.currentTask = null;
    this.filters = {
      search: '',
      allSites: true,
      william: false,
      yoursite: false,
      overdue: false
    };
    
    this.init();
  }
  
  init() {
    this.renderTasks();
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Filter toggle
    document.getElementById('taskFilterBtn').addEventListener('click', () => {
      const filters = document.getElementById('taskFilters');
      filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    });
    
    // Search
    document.getElementById('taskSearch').addEventListener('input', (e) => {
      this.filters.search = e.target.value.toLowerCase();
      this.renderTasks();
    });
    
    // Filter checkboxes
    document.getElementById('filterAllSites').addEventListener('change', (e) => {
      this.filters.allSites = e.target.checked;
      this.renderTasks();
    });
    
    document.getElementById('filterWilliam').addEventListener('change', (e) => {
      this.filters.william = e.target.checked;
      this.renderTasks();
    });
    
    document.getElementById('filterYourSite').addEventListener('change', (e) => {
      this.filters.yoursite = e.target.checked;
      this.renderTasks();
    });
    
    document.getElementById('filterOverdue').addEventListener('change', (e) => {
      this.filters.overdue = e.target.checked;
      this.renderTasks();
    });
    
    // Add task button
    document.getElementById('addTaskBtn').addEventListener('click', () => {
      this.openTaskModal();
    });
    
    // Export tasks
    document.getElementById('exportTasksBtn').addEventListener('click', () => {
      this.exportToText();
    });
    
    // Modal controls
    document.getElementById('closeTaskModal').addEventListener('click', () => {
      this.closeTaskModal();
    });
    
    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });
    
    document.getElementById('deleteTaskBtn').addEventListener('click', () => {
      if (confirm('Delete this task?')) {
        this.deleteTask();
      }
    });
    
    document.getElementById('addSubtaskBtn').addEventListener('click', () => {
      this.addSubtaskField();
    });
    
    // Close modal on background click
    document.getElementById('taskModal').addEventListener('click', (e) => {
      if (e.target.id === 'taskModal') {
        this.closeTaskModal();
      }
    });
  }
  
  renderTasks() {
    const taskList = document.getElementById('taskList');
    const filteredTasks = this.getFilteredTasks();
    
    // Group by category
    const grouped = {};
    filteredTasks.forEach(task => {
      const cat = task.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(task);
    });
    
    let html = '';
    Object.keys(grouped).forEach(category => {
      html += `<div class="task-category label">${category.toUpperCase()}</div>`;
      grouped[category].forEach(task => {
        html += this.renderTaskItem(task);
      });
    });
    
    taskList.innerHTML = html || '<div style="color: var(--muted); padding: 20px; text-align: center;">No tasks found</div>';
    
    // Attach click handlers
    document.querySelectorAll('.task-item').forEach(el => {
      const taskId = el.dataset.taskId;
      
      // Checkbox
      el.querySelector('.task-checkbox').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTask(taskId);
      });
      
      // Item click (open detail)
      el.addEventListener('click', () => {
        this.openTaskModal(taskId);
      });
    });
  }
  
  renderTaskItem(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const dueClass = isOverdue ? 'overdue' : '';
    const completedClass = task.completed ? 'completed' : '';
    
    const dueHtml = task.dueDate ? 
      `<span class="task-due ${dueClass}">Due: ${this.formatDate(task.dueDate)}</span>` : '';
    
    const subtasksHtml = task.subtasks && task.subtasks.length > 0 ?
      `<span class="task-subtasks label">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}</span>` : '';
    
    const reminderHtml = task.reminder ?
      `<span class="task-reminder label">Reminder: ${task.reminder}d</span>` : '';
    
    const assigneeHtml = task.assignee ?
      `<span class="task-assignee label">${task.assignee === 'william' ? 'William' : 'Jesse'}</span>` : '';
    
    return `
      <div class="task-item ${completedClass}" data-task-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            ${assigneeHtml}
            ${dueHtml}
            ${subtasksHtml}
            ${reminderHtml}
          </div>
        </div>
      </div>
    `;
  }
  
  getFilteredTasks() {
    let filtered = [...this.tasks];
    
    // Search filter
    if (this.filters.search) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(this.filters.search) ||
        (t.notes && t.notes.toLowerCase().includes(this.filters.search))
      );
    }
    
    // Site filter
    if (!this.filters.allSites) {
      const sites = [];
      if (this.filters.william) sites.push('william');
      if (this.filters.yoursite) sites.push('yoursite');
      if (sites.length > 0) {
        filtered = filtered.filter(t => sites.includes(t.site));
      }
    }
    
    // Overdue filter
    if (this.filters.overdue) {
      filtered = filtered.filter(t => {
        return t.dueDate && new Date(t.dueDate) < new Date() && !t.completed;
      });
    }
    
    return filtered;
  }
  
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
    }
  }
  
  openTaskModal(taskId = null) {
    this.currentTask = taskId;
    const modal = document.getElementById('taskModal');
    const task = taskId ? this.tasks.find(t => t.id === taskId) : null;
    
    // Populate form
    document.getElementById('taskModalTitle').textContent = task ? 'Edit Task' : 'New Task';
    document.getElementById('taskName').value = task ? task.title : '';
    document.getElementById('taskCategory').value = task ? task.category : '';
    document.getElementById('taskSite').value = task ? task.site : '';
    document.getElementById('taskDueDate').value = task ? task.dueDate : '';
    document.getElementById('taskReminder').value = task ? task.reminder : '';
    document.getElementById('taskDependencies').value = task ? task.dependencies : '';
    document.getElementById('taskNotes').value = task ? task.notes : '';
    
    // Show/hide delete button
    document.getElementById('deleteTaskBtn').style.display = task ? 'block' : 'none';
    
    // Render subtasks
    this.renderSubtasks(task ? task.subtasks : []);
    
    modal.classList.add('active');
  }
  
  closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
    this.currentTask = null;
  }
  
  renderSubtasks(subtasks = []) {
    const container = document.getElementById('subtasksList');
    container.innerHTML = subtasks.map((sub, i) => `
      <div class="form-group" style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        <input type="checkbox" ${sub.completed ? 'checked' : ''} data-subtask-index="${i}">
        <input type="text" value="${sub.title}" data-subtask-index="${i}" style="flex: 1;">
        <button type="button" class="icon-btn" data-remove-subtask="${i}">🗑️</button>
      </div>
    `).join('');
    
    // Attach remove handlers
    container.querySelectorAll('[data-remove-subtask]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.removeSubtask);
        subtasks.splice(index, 1);
        this.renderSubtasks(subtasks);
      });
    });
  }
  
  addSubtaskField() {
    const container = document.getElementById('subtasksList');
    const index = container.querySelectorAll('.form-group').length;
    const div = document.createElement('div');
    div.className = 'form-group';
    div.style.display = 'flex';
    div.style.gap = '8px';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <input type="checkbox" data-subtask-index="${index}">
      <input type="text" placeholder="New subtask" data-subtask-index="${index}" style="flex: 1;">
      <button type="button" class="icon-btn" data-remove-subtask="${index}">🗑️</button>
    `;
    container.appendChild(div);
    
    div.querySelector('[data-remove-subtask]').addEventListener('click', () => {
      div.remove();
    });
  }
  
  saveTask() {
    const name = document.getElementById('taskName').value.trim();
    if (!name) return;
    
    const subtasks = [];
    document.querySelectorAll('#subtasksList .form-group').forEach((group, i) => {
      const checkbox = group.querySelector('input[type="checkbox"]');
      const input = group.querySelector('input[type="text"]');
      if (input.value.trim()) {
        subtasks.push({
          id: `sub-${Date.now()}-${i}`,
          title: input.value.trim(),
          completed: checkbox.checked
        });
      }
    });
    
    const taskData = {
      title: name,
      category: document.getElementById('taskCategory').value.trim(),
      site: document.getElementById('taskSite').value,
      dueDate: document.getElementById('taskDueDate').value,
      reminder: parseInt(document.getElementById('taskReminder').value) || null,
      dependencies: document.getElementById('taskDependencies').value.trim(),
      notes: document.getElementById('taskNotes').value.trim(),
      subtasks: subtasks,
      assignee: 'jesse' // Default
    };
    
    if (this.currentTask) {
      // Update existing
      const task = this.tasks.find(t => t.id === this.currentTask);
      Object.assign(task, taskData);
    } else {
      // Create new
      const newTask = {
        id: `task-${Date.now()}`,
        completed: false,
        ...taskData
      };
      this.tasks.push(newTask);
    }
    
    this.saveTasks();
    this.renderTasks();
    this.closeTaskModal();
  }
  
  deleteTask() {
    if (!this.currentTask) return;
    this.tasks = this.tasks.filter(t => t.id !== this.currentTask);
    this.saveTasks();
    this.renderTasks();
    this.closeTaskModal();
  }
  
  saveTasks() {
    saveToStorage('tasks', this.tasks);
  }
  
  exportToText() {
    let text = '';
    const grouped = {};
    
    this.tasks.forEach(task => {
      const cat = task.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(task);
    });
    
    Object.keys(grouped).forEach(category => {
      text += `##${category.toUpperCase()}\n`;
      grouped[category].forEach(task => {
        const checkbox = task.completed ? '√' : '☐';
        text += `${checkbox} ${task.title}\n`;
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(sub => {
            const subCheck = sub.completed ? '√' : '☐';
            text += `\t${subCheck} ${sub.title}\n`;
          });
        }
      });
      text += '\n';
    });
    
    // Download as .txt
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}

// Initialize task manager (will be called from dashboard.js)
let taskManager;
