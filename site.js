// ══════════════════════════════════════════════════════════════
// SINGLE SITE VIEW LOGIC
// ══════════════════════════════════════════════════════════════

class SiteView {
  constructor(siteId) {
    this.siteId = siteId;
    this.currentView = 'admin'; // 'admin' or 'client'
    this.pinnedCards = new Set();
    this.cardOrder = {}; // { cardId: position }
    
    this.init();
  }
  
  init() {
    this.loadSiteData();
    this.attachEventListeners();
    this.renderCards();
  }
  
  loadSiteData() {
    // Load site-specific data from localStorage or API
    const site = SITES_DATA.find(s => s.id === this.siteId);
    if (site) {
      document.getElementById('siteTitle').textContent = site.name;
    }
    
    // Load pinned cards
    const savedPins = localStorage.getItem(`pinnedCards_${this.siteId}`);
    if (savedPins) {
      this.pinnedCards = new Set(JSON.parse(savedPins));
    }
    
    // Load card order
    const savedOrder = localStorage.getItem(`cardOrder_${this.siteId}`);
    if (savedOrder) {
      this.cardOrder = JSON.parse(savedOrder);
    }
  }
  
  attachEventListeners() {
    // Back to dashboard
    document.getElementById('backToDashboard').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
    
    // Collapse tasks button
    document.getElementById('collapseTasksBtn').addEventListener('click', () => {
      this.toggleTaskSidebar();
    });
    
    // View as client
    document.getElementById('viewAsClient').addEventListener('click', () => {
      this.switchView('client');
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
    
    // Card pin buttons
    document.querySelectorAll('.card-pin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.metric-card');
        const cardId = card.dataset.cardId;
        this.togglePin(cardId, btn);
      });
    });
    
    // Card clicks (expand to detail view)
    document.querySelectorAll('.metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const cardId = card.dataset.cardId;
        this.openCardDetail(cardId);
      });
    });
  }
  
  toggleTaskSidebar() {
    const sidebar = document.getElementById('taskSidebar');
    sidebar.classList.toggle('collapsed');
    
    // Save state
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('taskSidebarCollapsed', isCollapsed);
  }
  
  switchView(view) {
    this.currentView = view;
    
    if (view === 'client') {
      // Redirect to client view or toggle UI
      alert('Client view coming soon!\n\nThis will show:\n- Simplified metrics\n- Curated insights\n- Recommendations\n- No technical backend details');
    } else {
      // Admin view (default)
    }
  }
  
  switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  }
  
  togglePin(cardId, btn) {
    if (this.pinnedCards.has(cardId)) {
      this.pinnedCards.delete(cardId);
      btn.dataset.pinned = 'false';
    } else {
      this.pinnedCards.add(cardId);
      btn.dataset.pinned = 'true';
    }
    
    // Save to localStorage
    localStorage.setItem(
      `pinnedCards_${this.siteId}`,
      JSON.stringify([...this.pinnedCards])
    );
    
    // Re-render cards with pinned ones first
    this.renderCards();
  }
  
  renderCards() {
    const grid = document.getElementById('cardGrid');
    const cards = Array.from(grid.children);
    
    // Sort: pinned first, then by custom order, then default
    cards.sort((a, b) => {
      const aId = a.dataset.cardId;
      const bId = b.dataset.cardId;
      const aPinned = this.pinnedCards.has(aId);
      const bPinned = this.pinnedCards.has(bId);
      
      // Pinned cards come first
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Then by custom order
      const aOrder = this.cardOrder[aId] || 999;
      const bOrder = this.cardOrder[bId] || 999;
      return aOrder - bOrder;
    });
    
    // Re-append in sorted order
    cards.forEach(card => grid.appendChild(card));
  }
  
  openCardDetail(cardId) {
    // Open dedicated detail page or modal for this card
    console.log(`Opening detail view for card: ${cardId}`);
    alert(`Card Detail View\n\nThis will open a dedicated page for:\n${cardId}\n\nFeatures:\n- Expanded charts/graphs\n- Historical data\n- Admin notes\n- Customer notes\n- Export options`);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Get site ID from URL parameter or default to 'william'
  const urlParams = new URLSearchParams(window.location.search);
  const siteId = urlParams.get('site') || 'william';
  
  // Initialize site view
  window.siteView = new SiteView(siteId);
  
  // Initialize task manager (from tasks.js)
  window.taskManager = new TaskManager();
  
  // Filter tasks to show only this site's tasks
  taskManager.filters.allSites = false;
  taskManager.filters[siteId] = true;
  taskManager.renderTasks();
  
  // Restore collapsed state
  const isCollapsed = localStorage.getItem('taskSidebarCollapsed') === 'true';
  if (isCollapsed) {
    document.getElementById('taskSidebar').classList.add('collapsed');
  }
});
