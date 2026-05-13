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
    
    // Mark alert as dismissed
    this.dismissAlert();
  }
  
  resolveAlert() {
    if (!this.currentAlert) return;
    
    const alert = this.alerts.find(a => a.id === this.currentAlert);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      this.saveAlerts();
      this.updateAlertCount();
      this.showNextAlert();
    }
  }
  
  dismissAlert() {
    if (!this.currentAlert) return;
    
    const alert = this.alerts.find(a => a.id === this.currentAlert);
    if (alert) {
      alert.dismissed = true;
      alert.dismissedAt = Date.now();
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
    
    // Sort by timestamp (newest first)
    const sorted = [...this.alerts].sort((a, b) => b.timestamp - a.timestamp);
    
    if (sorted.length === 0) {
      container.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 40px;">No alerts in log</div>';
      return;
    }
    
    container.innerHTML = sorted.map(alert => {
      const status = alert.resolved ? 'RESOLVED' : alert.dismissed ? 'DISMISSED' : 'ACTIVE';
      const statusClass = alert.resolved || alert.dismissed ? 'resolved' : '';
      
      return `
        <div class="alert-log-item ${statusClass}">
          <div class="alert-log-icon">${alert.severity === 'error' ? '🔴' : '⚠️'}</div>
          <div class="alert-log-content">
            <div class="alert-log-text">${alert.text}</div>
            <div class="alert-log-meta">
              ${new Date(alert.timestamp).toLocaleString()} • ${alert.site}
            </div>
            <div class="alert-log-status">${status}</div>
          </div>
        </div>
      `;
    }).join('');
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
