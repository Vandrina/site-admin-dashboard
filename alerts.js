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
    
    // Alert actions
    document.getElementById('alertAddTask').addEventListener('click', () => {
      this.addAlertToTasks();
    });
    
    document.getElementById('alertResolve').addEventListener('click', () => {
      this.resolveAlert();
    });
    
    document.getElementById('alertDismiss').addEventListener('click', () => {
      this.dismissAlert();
    });
    
    // Close modal on background click
    document.getElementById('alertLogModal').addEventListener('click', (e) => {
      if (e.target.id === 'alertLogModal') {
        this.closeAlertLog();
      }
    });
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
  }
  
  renderAlertItem(alert) {
    const statusColors = {
      'ACTIVE': 'color: var(--alert);',
      'RESOLVED': 'color: #34d399;',
      'CLEARED': 'color: var(--muted);',
      'TASK LIST': 'color: #60a5fa;'
    };
    
    // Determine status based on actionType
    let status = 'ACTIVE';
    if (alert.actionType === 'task') {
      status = 'TASK LIST';
    } else if (alert.actionType === 'resolved') {
      status = 'RESOLVED';
    } else if (alert.actionType === 'cleared') {
      status = 'CLEARED';
    }
    
    const statusClass = alert.resolved || alert.dismissed ? 'resolved' : '';
    const severityBadge = alert.severity === 'error' ? 'badge-error' : 'badge-warning';
    const criticalLabel = alert.critical ? ' <span class="badge badge-error" style="margin-left: 4px;">CRITICAL</span>' : '';
    
    const actionsHtml = !alert.resolved && !alert.dismissed ? `
      <div class="alert-log-actions" style="margin-top: 8px; display: flex; gap: 8px;">
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="addTask">Add to Tasks</button>
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="resolve">Resolved</button>
        <button class="btn-link alert-log-action" data-alert-id="${alert.id}" data-action="dismiss">Clear</button>
      </div>
    ` : '';
    
    return `
      <div class="alert-log-item ${statusClass}">
        <div class="alert-log-icon">
          <span class="badge ${severityBadge}">${alert.severity.toUpperCase()}</span>
        </div>
        <div class="alert-log-content">
          <div class="alert-log-text">${alert.text}${criticalLabel}</div>
          <div class="alert-log-meta">
            ${new Date(alert.timestamp).toLocaleString()} • ${alert.site}
          </div>
          <div class="alert-log-status label" style="${statusColors[status]}">${status}</div>
          ${actionsHtml}
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
