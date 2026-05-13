// ══════════════════════════════════════════════════════════════
// TASK MANAGER
// ══════════════════════════════════════════════════════════════

class TaskManager {
  constructor() {
    this.tasks = loadFromStorage('tasks', TASKS_DATA);
    this.currentTask = null;
    this.collapsedCategories = new Set(); // Track collapsed categories
    this.filters = {
      search: '',
      allSites: true,
      william: false,
      yoursite: false,
      overdue: false,
      hideCompleted: false
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
    
    // Hide completed toggle
    document.getElementById('hideCompletedToggle').addEventListener('change', (e) => {
      this.filters.hideCompleted = e.target.checked;
      this.renderTasks();
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
    
    // Add task buttons (both)
    document.getElementById('addTaskBtnTop').addEventListener('click', () => {
      this.openTaskModal();
    });
    
    // Export tasks
    document.getElementById('exportTasksBtn').addEventListener('click', () => {
      this.exportToText();
    });
    
    // Settings button
    document.getElementById('taskSettingsBtn').addEventListener('click', () => {
      alert('Task Settings\n\nComing soon:\n- Manage categories\n- Manage people/assignees\n- Task templates');
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
    
    // Category dropdown - handle "add new"
    document.getElementById('taskCategory').addEventListener('change', (e) => {
      if (e.target.value === '__new__') {
        const newCat = prompt('New category name:');
        if (newCat) {
          const option = document.createElement('option');
          option.value = newCat;
          option.textContent = newCat;
          e.target.insertBefore(option, e.target.lastElementChild);
          e.target.value = newCat;
        } else {
          e.target.value = '';
        }
      }
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
    
    // Group by assignee first
    const byAssignee = { william: {}, jesse: {} };
    
    filteredTasks.forEach(task => {
      const assignee = task.assignee || 'jesse';
      const cat = task.category || 'Uncategorized';
      if (!byAssignee[assignee][cat]) byAssignee[assignee][cat] = [];
      byAssignee[assignee][cat].push(task);
    });
    
    // Sort tasks within each category: incomplete first, then completed
    Object.keys(byAssignee).forEach(assignee => {
      Object.keys(byAssignee[assignee]).forEach(category => {
        byAssignee[assignee][category].sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        });
      });
    });
    
    let html = '';
    
    // William's tasks first (unchanged)
    if (Object.keys(byAssignee.william).length > 0) {
      html += `<div class="task-section-header">William</div>`;
      Object.keys(byAssignee.william).forEach(category => {
        const categoryId = `william-${category}`;
        const isCollapsed = this.collapsedCategories.has(categoryId);
        const chevron = isCollapsed ? '›' : '▾';
        const incompleteCount = byAssignee.william[category].filter(t => !t.completed).length;
        const countBadge = isCollapsed && incompleteCount > 0 ? 
          `<span class="category-count">${incompleteCount}</span>` : '';
        
        html += `<div class="task-category label category-header" data-category-id="${categoryId}">
          <span class="category-chevron">${chevron}</span>
          ${category.toUpperCase()}
          ${countBadge}
        </div>`;
        html += `<div class="task-category-content ${isCollapsed ? 'collapsed' : ''}" data-category-id="${categoryId}">`;
        byAssignee.william[category].forEach(task => {
          html += this.renderTaskItem(task);
        });
        html += `</div>`;
      });
    }
    
    // Jesse's tasks - reorganized
    if (Object.keys(byAssignee.jesse).length > 0) {
      if (Object.keys(byAssignee.william).length > 0) {
        html += `<div class="task-section-divider"></div>`;
      }
      html += `<div class="task-section-header">Jesse</div>`;
      
      // ALERTS category always first
      if (byAssignee.jesse['ALERTS']) {
        const categoryId = 'jesse-ALERTS';
        const isCollapsed = this.collapsedCategories.has(categoryId);
        const chevron = isCollapsed ? '›' : '▾';
        const incompleteCount = byAssignee.jesse['ALERTS'].filter(t => !t.completed).length;
        const countBadge = isCollapsed && incompleteCount > 0 ? 
          `<span class="category-count">${incompleteCount}</span>` : '';
        
        html += `<div class="task-category label category-header" data-category-id="${categoryId}">
          <span class="category-chevron">${chevron}</span>
          ALERTS
          ${countBadge}
        </div>`;
        html += `<div class="task-category-content ${isCollapsed ? 'collapsed' : ''}" data-category-id="${categoryId}">`;
        byAssignee.jesse['ALERTS'].forEach(task => {
          html += this.renderTaskItem(task);
        });
        html += `</div>`;
      }
      
      // Group remaining tasks by priority and site
      const jesseTasks = [];
      Object.keys(byAssignee.jesse).forEach(category => {
        if (category !== 'ALERTS') {
          jesseTasks.push(...byAssignee.jesse[category]);
        }
      });
      
      // Separate urgent from non-urgent
      const urgentTasks = jesseTasks.filter(t => t.priority === 'urgent');
      const nonUrgentTasks = jesseTasks.filter(t => t.priority !== 'urgent');
      
      // Urgent section (with site tags)
      if (urgentTasks.length > 0) {
        const categoryId = 'jesse-URGENT';
        const isCollapsed = this.collapsedCategories.has(categoryId);
        const chevron = isCollapsed ? '›' : '▾';
        const incompleteCount = urgentTasks.filter(t => !t.completed).length;
        const countBadge = isCollapsed && incompleteCount > 0 ? 
          `<span class="category-count">${incompleteCount}</span>` : '';
        
        html += `<div class="task-category label category-header" data-category-id="${categoryId}">
          <span class="category-chevron">${chevron}</span>
          URGENT
          ${countBadge}
        </div>`;
        html += `<div class="task-category-content ${isCollapsed ? 'collapsed' : ''}" data-category-id="${categoryId}">`;
        urgentTasks.forEach(task => {
          html += this.renderTaskItem(task, true); // true = show site tag
        });
        html += `</div>`;
      }
      
      // Group non-urgent by site
      const bySite = {};
      nonUrgentTasks.forEach(task => {
        const site = task.site || 'general';
        if (!bySite[site]) bySite[site] = [];
        bySite[site].push(task);
      });
      
      // Render by site
      Object.keys(bySite).forEach(site => {
        const siteName = site === 'william' ? "William's Portfolio" : 
                        site === 'yoursite' ? 'Your Site' :
                        site === 'admin' ? 'Admin Dashboard' : 
                        site.toUpperCase();
        const categoryId = `jesse-${site}`;
        const isCollapsed = this.collapsedCategories.has(categoryId);
        const chevron = isCollapsed ? '›' : '▾';
        const incompleteCount = bySite[site].filter(t => !t.completed).length;
        const countBadge = isCollapsed && incompleteCount > 0 ? 
          `<span class="category-count">${incompleteCount}</span>` : '';
        
        html += `<div class="task-category label category-header" data-category-id="${categoryId}">
          <span class="category-chevron">${chevron}</span>
          ${siteName}
          ${countBadge}
        </div>`;
        html += `<div class="task-category-content ${isCollapsed ? 'collapsed' : ''}" data-category-id="${categoryId}">`;
        bySite[site].forEach(task => {
          html += this.renderTaskItem(task);
        });
        html += `</div>`;
      });
    }
    
    taskList.innerHTML = html || '<div style="color: var(--muted); padding: 20px; text-align: center;">No tasks found</div>';
    
    // Attach category collapse/expand handlers
    document.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const categoryId = header.dataset.categoryId;
        if (this.collapsedCategories.has(categoryId)) {
          this.collapsedCategories.delete(categoryId);
        } else {
          this.collapsedCategories.add(categoryId);
        }
        this.renderTasks();
      });
    });
    
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
  
  renderTaskItem(task, showSiteTag = false) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const dueClass = isOverdue ? 'overdue' : '';
    const completedClass = task.completed ? 'completed' : '';
    
    const dueHtml = task.dueDate ? 
      `<span class="task-due ${dueClass}">Due: ${this.formatDate(task.dueDate)}</span>` : '';
    
    const subtasksHtml = task.subtasks && task.subtasks.length > 0 ?
      `<span class="label" style="color: var(--accent);">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}</span>` : '';
    
    const reminderHtml = task.reminder ?
      `<span class="label" style="color: var(--accent);">Reminder: ${task.reminder}d</span>` : '';
    
    const priorityHtml = task.priority ?
      `<span class="task-priority ${task.priority}">${task.priority.replace('-', ' ')}</span>` : '';
    
    // Site tag for urgent tasks
    const siteTagHtml = showSiteTag && task.site ? 
      `<span class="task-site-tag label" style="color: var(--accent);">${task.site === 'william' ? 'WP' : task.site === 'yoursite' ? 'YS' : task.site === 'admin' ? 'AD' : task.site.toUpperCase()}</span>` : '';
    
    return `
      <div class="task-item ${completedClass}" data-task-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            ${siteTagHtml}
            ${priorityHtml}
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
    
    // Hide completed
    if (this.filters.hideCompleted) {
      filtered = filtered.filter(t => !t.completed);
    }
    
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
    
    // Handle category dropdown - check if value exists, otherwise select empty
    const categorySelect = document.getElementById('taskCategory');
    const taskCategory = task ? task.category : '';
    if (taskCategory && ![...categorySelect.options].some(opt => opt.value === taskCategory)) {
      // Add missing category
      const option = document.createElement('option');
      option.value = taskCategory;
      option.textContent = taskCategory;
      categorySelect.insertBefore(option, categorySelect.lastElementChild);
    }
    categorySelect.value = taskCategory;
    
    document.getElementById('taskSite').value = task ? task.site : '';
    document.getElementById('taskDueDate').value = task ? task.dueDate : '';
    document.getElementById('taskPriority').value = task ? task.priority : '';
    document.getElementById('taskReminder').value = task ? task.reminder : '';
    document.getElementById('taskAssignee').value = task ? task.assignee : 'jesse';
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
    
    const category = document.getElementById('taskCategory').value;
    
    const taskData = {
      title: name,
      category: category === '__new__' ? '' : category,
      site: document.getElementById('taskSite').value,
      dueDate: document.getElementById('taskDueDate').value,
      priority: document.getElementById('taskPriority').value,
      reminder: parseInt(document.getElementById('taskReminder').value) || null,
      assignee: document.getElementById('taskAssignee').value,
      dependencies: document.getElementById('taskDependencies').value.trim(),
      notes: document.getElementById('taskNotes').value.trim(),
      subtasks: subtasks
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
