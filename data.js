// ══════════════════════════════════════════════════════════════
// MOCK DATA - Sites, Tasks, Alerts
// ══════════════════════════════════════════════════════════════

const SITES_DATA = [
  {
    id: 'william',
    name: "William's Portfolio",
    url: 'williammcguire.net',
    status: 'up',
    uptime: '99.94%',
    ssl_days: 7,
    views: 1234,
    speed: 94,
    alerts: 2
  },
  {
    id: 'yoursite',
    name: 'Your Site',
    url: 'yourdomain.com',
    status: 'up',
    uptime: '99.98%',
    ssl_days: 45,
    views: 450,
    speed: 89,
    alerts: 3
  }
];

const TASKS_DATA = [
  // ══════ OVERALL ══════
  {
    id: 'task-1',
    title: 'Image for SABI for Client Button on Home Page',
    category: 'OVERALL',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: null,
    notes: 'Assuming you want a direct link to them',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-2',
    title: 'Favicon 32x32',
    category: 'OVERALL',
    site: 'william',
    completed: true,
    assignee: 'william',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-3',
    title: 'Large OG image as PNG',
    category: 'OVERALL',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-4',
    title: 'Convert .mov files to .mp4',
    category: 'OVERALL',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: '2026-05-20',
    notes: 'Use HandBrake preset: Web/Fast 1080p. Store in R2 bucket after.',
    dependencies: '',
    subtasks: [
      { id: 'sub-1', title: '2D: 007', completed: false },
      { id: 'sub-2', title: '2D: 008', completed: false },
      { id: 'sub-3', title: '2D: 009', completed: false },
      { id: 'sub-4', title: '2D: 010', completed: false },
      { id: 'sub-5', title: '2D: 011', completed: false },
      { id: 'sub-6', title: '2D: 012', completed: false },
      { id: 'sub-7', title: '2D: 013', completed: false },
      { id: 'sub-8', title: '2D: 014', completed: false },
      { id: 'sub-9', title: '3D: 002', completed: false },
      { id: 'sub-10', title: '3D: 003', completed: false }
    ]
  },
  {
    id: 'task-5',
    title: 'Add Titles in Image Tagger for important pieces',
    category: 'OVERALL',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  
  // ══════ IMAGE SORTING ══════
  {
    id: 'task-6',
    title: 'Top ten images from every image in sort order 1-10',
    category: 'Image Sorting',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-7',
    title: 'Each category should have 11-15 for the top five',
    category: 'Image Sorting',
    site: 'william',
    completed: false,
    assignee: 'william',
    dueDate: null,
    notes: 'Rest of the images will be in the order you tag, across discipline or client',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-8',
    title: 'Missing THUMBNAIL FOR 2d animation 009',
    category: 'Image Sorting',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  
  // ══════ HOMEPAGE ══════
  {
    id: 'task-9',
    title: 'Five hero gallery images at 800px x 450px (16:9)',
    category: 'Homepage',
    site: 'william',
    completed: true,
    assignee: 'william',
    dueDate: null,
    notes: 'Up to 600px',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-10',
    title: 'Replacement images for each client at 330x200px (5:3)',
    category: 'Homepage',
    site: 'william',
    completed: true,
    assignee: 'william',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  
  // ══════ JESSE'S STUFF (POST PRODUCTION) ══════
  {
    id: 'task-11',
    title: 'Scroll to top fixed on gallery',
    category: "Jesse's Stuff",
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-12',
    title: 'Analytics inline code',
    category: "Jesse's Stuff",
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-13',
    title: 'Analytics event for each image - lightbox script',
    category: "Jesse's Stuff",
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-14',
    title: 'Uptime monitor',
    category: "Jesse's Stuff",
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-15',
    title: 'Evaluate uptime monitors',
    category: "Jesse's Stuff",
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    reminder: 30,
    notes: 'Check effectiveness and competitors',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-16',
    title: 'Update .py scripts to run from folder',
    category: "Jesse's Stuff",
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  
  // ══════ ACCESSIBILITY ══════
  {
    id: 'task-17',
    title: 'Accessibility audit',
    category: 'Accessibility',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-18',
    title: 'Hero gallery alt text',
    category: 'Accessibility',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-19',
    title: 'Lightbox nav aria',
    category: 'Accessibility',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-20',
    title: 'Filter button aria or legend',
    category: 'Accessibility',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-21',
    title: 'Hamburger menu animation @media prefers-reduced-motion: reduce',
    category: 'Accessibility',
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-22',
    title: 'Gallery filter announce changes',
    category: 'Accessibility',
    site: 'william',
    completed: false,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  },
  {
    id: 'task-23',
    title: 'Focus style - custom',
    category: 'Accessibility',
    site: 'william',
    completed: true,
    assignee: 'jesse',
    dueDate: null,
    notes: '',
    dependencies: '',
    subtasks: []
  }
];

const ALERTS_DATA = [
  {
    id: 'alert-1',
    text: "William's site SSL certificate expires in 7 days",
    site: 'william',
    severity: 'warning',
    critical: true,
    timestamp: Date.now() - 3600000,
    resolved: false,
    dismissed: false
  },
  {
    id: 'alert-2',
    text: '1 broken image found in gallery manifest check',
    site: 'william',
    severity: 'warning',
    critical: false,
    timestamp: Date.now() - 7200000,
    resolved: false,
    dismissed: false
  },
  {
    id: 'alert-3',
    text: 'Your site has 3 JS errors in the past hour',
    site: 'yoursite',
    severity: 'error',
    critical: true,
    timestamp: Date.now() - 1800000,
    resolved: false,
    dismissed: false
  }
];

// ══════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ══════════════════════════════════════════════════════════════

function loadFromStorage(key, defaultData) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize data if not in localStorage
if (!localStorage.getItem('sites')) {
  saveToStorage('sites', SITES_DATA);
}

if (!localStorage.getItem('tasks')) {
  saveToStorage('tasks', TASKS_DATA);
}

if (!localStorage.getItem('alerts')) {
  saveToStorage('alerts', ALERTS_DATA);
}
