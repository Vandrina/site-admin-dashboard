// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════

class Dashboard {
  constructor() {
    this.sites = loadFromStorage('sites', SITES_DATA);
    this.init();
  }
  
  init() {
    this.renderSites();
    this.attachEventListeners();
    
    // Initialize other components
    taskManager = new TaskManager();
    alertSystem = new AlertSystem();
  }
  
  attachEventListeners() {
    // Add site button
    document.getElementById('addSiteBtn').addEventListener('click', () => {
      this.addSite();
    });
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });
  }
  
  renderSites() {
    const grid = document.getElementById('sitesGrid');
    
    grid.innerHTML = this.sites.map(site => `
      <div class="site-card" data-site-id="${site.id}">
        <div class="site-card-header">
          <h3 class="site-name">${site.name}</h3>
          <span class="site-status">${site.status === 'up' ? '✅' : '❌'}</span>
        </div>
        
        <div class="site-stats">
          <div class="site-stat">
            <div class="stat-label">Uptime</div>
            <div class="stat-value">${site.uptime}</div>
          </div>
          
          <div class="site-stat">
            <div class="stat-label">SSL Cert</div>
            <div class="stat-value ${site.ssl_days < 14 ? 'warning' : ''}">${site.ssl_days}d</div>
          </div>
          
          <div class="site-stat">
            <div class="stat-label">Views</div>
            <div class="stat-value">${this.formatNumber(site.views)}</div>
          </div>
          
          <div class="site-stat">
            <div class="stat-label">Speed</div>
            <div class="stat-value">${site.speed}</div>
          </div>
        </div>
        
        ${site.alerts > 0 ? `
          <div class="site-alerts">
            ⚠️ ${site.alerts} alert${site.alerts > 1 ? 's' : ''} requiring attention
          </div>
        ` : ''}
      </div>
    `).join('');
    
    // Attach click handlers
    document.querySelectorAll('.site-card').forEach(card => {
      card.addEventListener('click', () => {
        const siteId = card.dataset.siteId;
        this.openSiteDetail(siteId);
      });
    });
  }
  
  openSiteDetail(siteId) {
    // TODO: Navigate to single-site detailed view
    // For now, just show alert
    const site = this.sites.find(s => s.id === siteId);
    alert(`Opening detailed view for ${site.name}\n\nThis will be implemented in the next phase.`);
  }
  
  addSite() {
    const name = prompt('Site name:');
    if (!name) return;
    
    const url = prompt('Site URL:');
    if (!url) return;
    
    const newSite = {
      id: `site-${Date.now()}`,
      name,
      url,
      status: 'up',
      uptime: '100%',
      ssl_days: 90,
      views: 0,
      speed: 0,
      alerts: 0
    };
    
    this.sites.push(newSite);
    this.saveSites();
    this.renderSites();
  }
  
  openSettings() {
    alert('Settings panel\n\nComing soon:\n- API key management\n- Theme customization\n- Export/import data\n- Notification preferences');
  }
  
  saveSites() {
    saveToStorage('sites', this.sites);
  }
  
  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}

// ══════════════════════════════════════════════════════════════
// INITIALIZE DASHBOARD
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new Dashboard();
});
