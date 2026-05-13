// ══════════════════════════════════════════════════════════════
// ALERT SYSTEM
// ══════════════════════════════════════════════════════════════

class AlertSystem {
  constructor() {
    this.alerts = loadFromStorage('alerts', ALERTS_DATA);
    this.currentAlert = null;
    this.init();
  }
  
  init() {
    this.updateAlertCount();
    this.showNextAlert();
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Alert log button
    document.getElementById('alertLogBtn').addEventListener('click', () => {
      this.openAlertLog();
    });
    
    // View log button (full log page)
    document.getElementById('viewAlertLog').addEventListener('click', () => {
      this.openFullLog();
    });
    
    // Close alert log
    document.getElementById('closeAlertLog').addEventListener('click', () => {
      this.closeAlertLog();
    });
    
    // Alert banner actions
    document.getElementById('alertAddTask').addEventListener('click', () => {
      this.addAlertToTasks();
    });
    
    document.getElementById('alertResolve').addEventListener('click', () => {
      this.resolveAlert();
    });
    
    document.getElementById('alertHide').addEventListener('click', () => {
      this.hideAlert();
    });
    
    document.getElementById('alertDismissBanner').addEventListener('click', () => {
      this.dismissAlert();
    });
    
    // Close modal on background click
    document.getElementById('alertLogModal').addEventListener('click', (e) => {
      if (e.target.id === 'alertLogModal') {
        this.closeAlertLog();
      }
    });
  }
  
  hideAlert() {
    // Just hide the banner, alert stays in list
    this.currentAlert = null;
    this.showNextAlert();
  }
  
  openFullLog() {
    alert('Alert Log\n\nComing soon:\n- Full alert history\n- Reverse chronological order\n- Unresolved at top\n- Status: Resolved, Cleared, Task List, Ignored\n- Color-coded status\n- Export to CSV');
  }
  
  showNextAlert() {
    const active = this.alerts.find(a => !a.resolved && !a.dismissed);
    if (!active) {
      document.getElementById('alertBanner').classList.remove('active');
      return;
    }
    
    this.currentAlert = active.id;
    document.getElementById('alertText').textContent = active.text;
    document.getElementById('alertBanner').classList.add('active');
  }
  
  addAlertToTasks() {
    if (!this.currentAlert) return;
    
    const alert = this.alerts.find(a => a.id === this.currentAlert);
    if (!alert) return;
    
    // Extract due date from alert text if it mentions days
    const daysMatch = alert.text.match(/(\d+)\s*day/i);
    let dueDate = null;
    if (daysMatch) {
      const days = parseInt(daysMatch[1]) - 1; // 1 day before
      const date = new Date();
      date.setDate(date.getDate() + days);
      dueDate = date.toISOString().split('T')[0];
    }
    
    // Create task from alert
    const task = {
      id: `task-${Date.now()}`,
      title: alert.text,
      category: 'ALERTS',
      site: alert.site,
      completed: false,
      assignee: 'jesse',
      dueDate: dueDate,
      notes: `Auto-generated from alert on ${new Date(alert.timestamp).toLocaleDateString()}`,
      dependencies: '',
      subtasks: []
    };
    
    taskManager.tasks.push(task);
    taskManager.saveTasks();
    taskManager.renderTasks();
    
    // Mark alert with action type
    alert.actionType = 'task';
    alert.dismissed = true;
    alert.dismissedAt = Date.now();
    alert.sessionAction = true; // For showing in current session only
    
    this.saveAlerts();
    this.updateAlertCount();
    this.showNextAlert();
  }
  
  resolveAlert() {
    if (!this.currentAlert) return;
    
    const alert = this.alerts.find(a => a.id === this.currentAlert);
    if (alert) {
      alert.actionType = 'resolved';
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      alert.sessionAction = true; // For showing in current session only
      this.saveAlerts();
      this.updateAlertCount();
      this.showNextAlert();
    }
  }
  
  dismissAlert() {
    if (!this.currentAlert) return;
    
    const alert = this.alerts.find(a => a.id === this.currentAlert);
    if (alert) {
      alert.actionType = 'cleared';
      alert.dismissed = true;
      alert.dismissedAt = Date.now();
      alert.sessionAction = true; // For showing in current session only
      this.saveAlerts();
      this.updateAlertCount();
      this.showNextAlert();
    }
  }
  
  updateAlertCount() {
    const activeCount = this.alerts.filter(a => !a.resolved && !a.dismissed).length;
    document.getElementById('alertCount').textContent = activeCount;
    
    // Hide badge if no alerts
    document.getElementById('alertCount').style.display = activeCount > 0 ? 'flex' : 'none';
  }
  
  openAlertLog() {
    this.renderAlertLog();
    document.getElementById('alertLogModal').classList.add('active');
  }
  
  closeAlertLog() {
    document.getElementById('alertLogModal').classList.remove('active');
  }
  
  renderAlertLog() {
    const container = document.getElementById('alertLogList');
    
    // Sort by timestamp (newest first), then by status (active first)
    const sorted = [...this.alerts].sort((a, b) => {
      // Active/unresolved first
      const aActive = !a.resolved && !a.dismissed;
      const bActive = !b.resolved && !b.dismissed;
      if (aActive !== bActive) return aActive ? -1 : 1;
      
      // Then by timestamp
      return b.timestamp - a.timestamp;
    });
    
    if (sorted.length === 0) {
      container.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 40px;">No alerts</div>';
      return;
    }
    
    // Separate active and actioned (only show session actions)
    const active = sorted.filter(a => !a.resolved && !a.dismissed);
    const actioned = sorted.filter(a => (a.resolved || a.dismissed) && a.sessionAction);
    
    let html = '';
    
    // Active alerts
    active.forEach(alert => {
      html += this.renderAlertItem(alert);
    });
    
    // Actioned section (current session only)
    if (actioned.length > 0) {
      html += `<div class="alert-section-divider">Actioned (This Session)</div>`;
      actioned.forEach(alert => {
        html += this.renderAlertItem(alert);
      });
    }
    
    container.innerHTML = html;
    
    // Attach action button handlers
    document.querySelectorAll('.alert-log-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        const action = e.target.dataset.action;
        
        if (action === 'addTask') {
          this.currentAlert = alertId;
          this.addAlertToTasks();
        } else if (action === 'resolve') {
          this.currentAlert = alertId;
          this.resolveAlert();
        } else if (action === 'dismiss') {
          this.currentAlert = alertId;
          this.dismissAlert();
        }
        
        // Re-render after action
        setTimeout(() => this.renderAlertLog(), 100);
      });
    });
    
    // Attach undo button handlers
    document.querySelectorAll('.alert-undo-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const alertId = e.target.dataset.alertId;
        this.undoAlertAction(alertId);
        setTimeout(() => this.renderAlertLog(), 100);
      });
    });
  }
  
  undoAlertAction(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    // If it was added to tasks, remove the task
    if (alert.actionType === 'task') {
      const taskToRemove = taskManager.tasks.find(t => 
        t.title === alert.text && t.category === 'ALERTS'
      );
      if (taskToRemove) {
        taskManager.tasks = taskManager.tasks.filter(t => t.id !== taskToRemove.id);
        taskManager.saveTasks();
        taskManager.renderTasks();
      }
    }
    
    // Reset alert to active state
    alert.resolved = false;
    alert.dismissed = false;
    alert.actionType = null;
    alert.sessionAction = false;
    delete alert.resolvedAt;
    delete alert.dismissedAt;
    
    this.saveAlerts();
    this.updateAlertCount();
    this.showNextAlert();
  }
  
  renderAlertItem(alert) {
    const status = alert.actionType === 'task' ? 'TASK LIST' :
                   alert.actionType === 'resolved' ? 'RESOLVED' :
                   alert.actionType === 'cleared' ? 'CLEARED' : 'ACTIVE';
    
    const statusClass = alert.resolved || alert.dismissed ? 'resolved' : '';
    const severityBadge = alert.severity === 'error' ? 'badge-error' : 'badge-warning';
    const criticalLabel = alert.critical ? `<span class="badge badge-error alert-critical-badge">CRITICAL</span>` : '';
    
    // Active alerts get action buttons
    const actionsHtml = !alert.resolved && !alert.dismissed ? `
      <div class="alert-log-actions" style="margin-top: 8px; display: flex; gap: 16px;">
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="addTask">Add to Tasks</button>
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="resolve">Resolved</button>
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="dismiss">Dismiss</button>
      </div>
    ` : '';
    
    // Actioned alerts get undo button
    const undoHtml = (alert.resolved || alert.dismissed) && alert.sessionAction ? `
      <div class="alert-log-actions" style="margin-top: 8px;">
        <button class="btn-link alert-undo-action" data-alert-id="${alert.id}">Undo</button>
      </div>
    ` : '';
    
    return `
      <div class="alert-log-item ${statusClass}">
        <div class="alert-log-icon">
          <span class="badge ${severityBadge}">${alert.severity.toUpperCase()}</span>
        </div>
        <div class="alert-log-content">
          <div class="alert-log-header">
            <div class="alert-log-text">${alert.text}</div>
            ${criticalLabel}
          </div>
          <div class="alert-log-meta">
            ${new Date(alert.timestamp).toLocaleString()} • ${alert.site}
          </div>
          <div class="alert-log-status label">${status}</div>
          ${actionsHtml}
          ${undoHtml}
        </div>
      </div>
    `;
  }
  
  saveAlerts() {
    saveToStorage('alerts', this.alerts);
  }
  
  // Add new alert (for testing or future use)
  addAlert(text, site, severity = 'warning') {
    const alert = {
      id: `alert-${Date.now()}`,
      text,
      site,
      severity,
      timestamp: Date.now(),
      resolved: false,
      dismissed: false
    };
    this.alerts.push(alert);
    this.saveAlerts();
    this.updateAlertCount();
    this.showNextAlert();
  }
}

// Initialize alert system (will be called from dashboard.js)
let alertSystem;
