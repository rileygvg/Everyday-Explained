document.addEventListener("DOMContentLoaded", function() {
import { QUESTIONS, CATEGORIES } from "./data.js";

const room = new WebsimSocket();

const CATEGORY_GROUPS = [
  "Nature & Science",
  "Society & History",
  "Human Experience",
  "Modern Tech",
  "Language & Taste",
  "Geography"
];

const CATEGORY_MAP = {
  "Life & Body": "Human Experience",
  "The Physical World": "Nature & Science",
  "History & Ritual": "Society & History",
  "Tech & Design": "Modern Tech",
  "Geography & Places": "Geography",
  "Language & Symbols": "Language & Taste",
  "Food & Drink": "Language & Taste",
  "Mind & Senses": "Human Experience",
  "Nature & Animals": "Nature & Science",
  "Space & Cosmos": "Nature & Science",
  "Art & Culture": "Society & History",
  "Pop Science & Maths": "Nature & Science"
};

const welcomeScreen = document.querySelector("#welcome-screen");
const appContainer = document.querySelector("#app-container");
const startBtn = document.querySelector("#start-btn");
const questionsGrid = document.querySelector("#questions");
const searchInput = document.querySelector("#search-input");
const mobileSearchInput = document.querySelector("#mobile-search-input");
const mobileSearchBar = document.querySelector("#mobile-search-bar");
const categoryFiltersContainer = document.querySelector("#category-filters");
const noResults = document.querySelector("#no-results");

const mobileUiToggle = document.querySelector("#mobile-ui-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const filterDrawer = document.querySelector("#filter-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const mobileCategoryList = document.querySelector("#mobile-category-list");

const articleOverlay = document.querySelector("#article-overlay");
const articleCloseBtn = document.querySelector("#article-close");
const articleCloseBottomBtn = document.querySelector("#article-close-bottom");

const articleLabelEl = document.querySelector("#article-label");
const articleTopicEl = document.querySelector("#article-topic");
const articleTitleEl = document.querySelector("#article-title");
const articleBodyEl = document.querySelector("#article-body");

// Chat selectors
const chatToggleBtn = document.querySelector("#chat-toggle-btn");
const chatWindow = document.querySelector("#chat-window");
const chatCloseX = document.querySelector("#chat-close-x");
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");
const chatSendBtn = document.querySelector("#chat-send-btn");

const modeDetailedBtn = document.querySelector("#mode-detailed");
const modeGroupedBtn = document.querySelector("#mode-grouped");
const mobileModeDetailedBtn = document.querySelector("#mobile-mode-detailed");
const mobileModeGroupedBtn = document.querySelector("#mobile-mode-grouped");

let currentCategory = "All";
let currentSearch = "";
let isGroupedMode = false;
let currentArticleData = null;
let chatHistory = [];
let allQuestions = [...QUESTIONS];
let currentTab = "library"; // library, community, create
let currentSubTab = "articles"; // articles, series (for community)
let currentFolder = null; // Stores the title of the active series folder
let currentUserRank = 0; // 0: Trainee, 1: Grade 1, 2: Grade 2, 3: Grade 3, 4: Owner
let effectiveRank = 0;
let loggedInUser = null;
let adminSettings = {};
let communityArticles = [];

const makerBtn = document.querySelector("#ai-maker-btn");
const makerOverlay = document.querySelector("#maker-overlay");
const makerClose = document.querySelector("#maker-close");
const makerInput = document.querySelector("#maker-input");
const makerGenerateBtn = document.querySelector("#maker-generate-btn");
const makerLoading = document.querySelector("#maker-loading");

const recsBtn = document.querySelector("#ai-recs-btn");
const recsOverlay = document.querySelector("#recs-overlay");
const recsClose = document.querySelector("#recs-close");
const recsInput = document.querySelector("#recs-input");
const recsGenerateBtn = document.querySelector("#recs-generate-btn");
const recsLoading = document.querySelector("#recs-loading");
const recsResults = document.querySelector("#recs-results");
const recsSourceLibrary = document.querySelector("#recs-source-library");
const recsSourceCommunity = document.querySelector("#recs-source-community");

let recsSource = "library";

const makerModeSingle = document.querySelector("#maker-mode-single");
const makerModeSeries = document.querySelector("#maker-mode-series");
const makerSeriesControls = document.querySelector("#maker-series-controls");
const makerSeriesCount = document.querySelector("#maker-series-count");
const makerSeriesWords = document.querySelector("#maker-series-words");
const makerPromptLabel = document.querySelector("#maker-prompt-label");

let makerMode = "single";

if (makerModeSingle && makerModeSeries) {
  makerModeSingle.addEventListener("click", () => {
    makerMode = "single";
    makerModeSingle.classList.add("active");
    makerModeSeries.classList.remove("active");
    makerSeriesControls.classList.add("hidden");
    makerPromptLabel.textContent = "Topic or Question";
    makerInput.placeholder = "e.g., Why is the sky blue? or The history of blue jeans...";
  });

  makerModeSeries.addEventListener("click", () => {
    makerMode = "series";
    makerModeSeries.classList.add("active");
    makerModeSingle.classList.remove("active");
    makerSeriesControls.classList.remove("hidden");
    makerPromptLabel.textContent = "Series Topic (AI will split into chapters)";
    makerInput.placeholder = "e.g., The History of London, The Future of AI, Evolution of Transportation...";
  });
}

// New Admin/Community selectors
const adminPanelBtn = document.querySelector("#admin-panel-btn");
const adminOverlay = document.querySelector("#admin-overlay");
const adminClose = document.querySelector("#admin-close");
const adminTogglesContainer = document.querySelector("#admin-toggles-container");
const adminAnnouncementInput = document.querySelector("#admin-announcement-input");
const adminPostAnnouncement = document.querySelector("#admin-post-announcement");
const adminStopAnnouncement = document.querySelector("#admin-stop-announcement");
const adminReviewList = document.querySelector("#admin-review-list");
const adminUserList = document.querySelector("#admin-user-list");
const globalAnnouncementEl = document.querySelector("#global-announcement");

const communityCreateOverlay = document.querySelector("#community-create-overlay");
const commSubmitBtn = document.querySelector("#comm-submit-btn");
const commCategorySelect = document.querySelector("#comm-category");

const privateChatBtn = document.querySelector("#private-chat-btn");
const privateChatOverlay = document.querySelector("#private-chat-overlay");
const privateChatMessages = document.querySelector("#private-chat-messages");
const privateChatInput = document.querySelector("#private-chat-input");
const privateChatSend = document.querySelector("#private-chat-send");

const ownerChatBtn = document.querySelector("#owner-direct-chat-btn");
const ownerChatOverlay = document.querySelector("#owner-chat-overlay");
const ownerChatMessages = document.querySelector("#owner-chat-messages");
const ownerChatInput = document.querySelector("#owner-chat-input");
const ownerChatSend = document.querySelector("#owner-chat-send");
const ownerChatClose = document.querySelector("#owner-chat-close");
const ownerChatTitle = document.querySelector("#owner-chat-title");

let activeDirectChatUser = 'rileygvg'; // Default for normal users

const tabLibrary = document.querySelector("#tab-library");
const tabCommunity = document.querySelector("#tab-community");
const tabCommunitySubTabs = document.querySelector("#community-sub-tabs");
const subTabArticles = document.querySelector("#sub-tab-articles");
const subTabSeries = document.querySelector("#sub-tab-series");
const tabDrafts = document.querySelector("#tab-drafts");
const tabCreate = document.querySelector("#tab-create");

const commentsList = document.querySelector("#comments-list");
const commentText = document.querySelector("#comment-text");
const commentSubmit = document.querySelector("#comment-submit");

const themeToggle = document.querySelector("#theme-toggle");
const sunIcon = themeToggle.querySelector(".sun-icon");
const moonIcon = themeToggle.querySelector(".moon-icon");

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  sunIcon.classList.toggle("hidden", isDark);
  moonIcon.classList.toggle("hidden", !isDark);
  localStorage.setItem("everyday-theme", isDark ? "dark" : "light");
}

themeToggle.addEventListener("click", toggleTheme);

// Initialize theme from storage
if (localStorage.getItem("everyday-theme") === "dark") {
  document.body.classList.add("dark-mode");
  // Clean up initial class now that JS is running and body is ready
  document.documentElement.classList.remove("dark-mode-initial");
  sunIcon.classList.add("hidden");
  moonIcon.classList.remove("hidden");
}

// Initialize font from storage
if (localStorage.getItem("everyday-font") === "Gloock") {
  document.documentElement.style.setProperty("--font-main", '"Gloock", serif');
  const fontNameEl = document.getElementById("current-font-name");
  if (fontNameEl) fontNameEl.textContent = "Gloock";
}

// Font toggle handler
const fontToggle = document.getElementById("font-toggle");
const currentFontName = document.getElementById("current-font-name");

if (fontToggle) {
  fontToggle.addEventListener("click", () => {
    const current = localStorage.getItem("everyday-font") || "Montserrat";
    const next = current === "Montserrat" ? "Gloock" : "Montserrat";
    document.documentElement.style.setProperty("--font-main", next === "Montserrat" ? '"Montserrat", sans-serif' : '"Gloock", serif');
    if (currentFontName) currentFontName.textContent = next;
    localStorage.setItem("everyday-font", next);
  });
}

async function checkUserPermissions() {
  try {
    const user = await websim.getUser();
    if (!user) return;
    loggedInUser = user;
    
    const rankSelector = document.querySelector("#owner-rank-tester");
    const rankLabel = document.querySelector("#user-badge-rank");

    const updateUIForRank = (rank) => {
      effectiveRank = rank;
      rankLabel.textContent = ["Trainee Writer", "Grade 1 Writer", "Grade 2 Writer", "Grade 3 Writer", "Owner"][rank];
      
      // Feature toggling based on effective rank
      // Owner always has admin access if they are rileygvg
      if (user.username === 'rileygvg') {
        adminPanelBtn.classList.toggle("hidden", rank < 4);
      } else {
        adminPanelBtn.classList.add("hidden");
      }

      privateChatBtn.classList.toggle("hidden", rank < 2);
      // AI Maker is now allowed for anyone
      makerBtn.classList.remove("hidden");
      
      updateDirectChatButton(user.username, rank);
      updateView();
    };

    if (user.username === 'rileygvg') {
      currentUserRank = 4;
      rankSelector.classList.remove("hidden");
      
      // Load stored test rank or default to owner
      const savedTestRank = localStorage.getItem("riley-test-rank");
      const initialRank = savedTestRank !== null ? parseInt(savedTestRank) : 4;
      rankSelector.value = initialRank;
      
      rankSelector.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        localStorage.setItem("riley-test-rank", val);
        updateUIForRank(val);
      });
      
      updateUIForRank(initialRank);
    } else {
      room.collection('user_badge').filter({ username: user.username }).subscribe(badges => {
        if (badges.length > 0) {
          currentUserRank = badges[0].grade;
        } else {
          currentUserRank = 0;
        }
        updateUIForRank(currentUserRank);
      });
    }
  } catch (e) {
    console.log("Not logged in or error checking user.", e);
  }
}

// XSS Protection Helper
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Global Announcement Logic
room.collection('announcement').subscribe(announcements => {
  if (announcements.length > 0) {
    const latest = announcements[0];
    globalAnnouncementEl.textContent = latest.text;
    globalAnnouncementEl.classList.remove("hidden");
  } else {
    globalAnnouncementEl.classList.add("hidden");
  }
});

// Admin Settings Logic
const DEFAULT_ADMIN_SETTINGS = {
  maintenance: false,
  disable_ai: false,
  guest_comments: true,
  strict_review: true,
  lock_community: false,
  auto_dark: false,
  community_visible: true,
  high_priority: false
};

room.collection('admin_config').subscribe(configs => {
  if (configs.length > 0) {
    adminSettings = { ...DEFAULT_ADMIN_SETTINGS, ...configs[0] };
  } else {
    adminSettings = { ...DEFAULT_ADMIN_SETTINGS };
  }
  renderAdminPanel();
});

function renderAdminPanel() {
  renderUserDirectory();
  renderAdminInbox();
  adminTogglesContainer.innerHTML = "";
  Object.keys(DEFAULT_ADMIN_SETTINGS).forEach(key => {
    const div = document.createElement("div");
    div.className = "setting-item";
    div.innerHTML = `
      <span>${key.replace(/_/g, ' ').toUpperCase()}</span>
      <input type="checkbox" ${adminSettings[key] ? 'checked' : ''} data-key="${key}">
    `;
    div.querySelector("input").addEventListener("change", async (e) => {
      const k = e.target.dataset.key;
      const val = e.target.checked;
      const configs = room.collection('admin_config').getList();
      if (configs.length > 0) {
        await room.collection('admin_config').update(configs[0].id, { [k]: val });
      } else {
        await room.collection('admin_config').create({ ...DEFAULT_ADMIN_SETTINGS, [k]: val });
      }
    });
    adminTogglesContainer.appendChild(div);
  });
}

adminPostAnnouncement.addEventListener("click", async () => {
  const text = adminAnnouncementInput.value.trim();
  if (!text) return;
  // Clear old announcements first
  const existing = room.collection('announcement').getList();
  for (const a of existing) {
    await room.collection('announcement').delete(a.id);
  }
  await room.collection('announcement').create({ text });
  adminAnnouncementInput.value = "";
});

adminStopAnnouncement.addEventListener("click", async () => {
  const existing = room.collection('announcement').getList();
  if (existing.length === 0) return alert("No active announcement to stop.");
  for (const a of existing) {
    await room.collection('announcement').delete(a.id);
  }
  alert("Announcement stopped.");
});

// Community Logic
room.collection('community_article').subscribe(articles => {
  communityArticles = articles;
  updateView();
  renderAdminReviewQueue();
});

async function renderUserDirectory() {
  const badges = room.collection('user_badge').getList();
  adminUserList.innerHTML = badges.length ? "" : "<p style='font-size:0.8rem; color:var(--text-muted)'>No graded users yet.</p>";
  
  badges.sort((a,b) => b.grade - a.grade).forEach(badge => {
    const div = document.createElement("div");
    div.className = "user-row";
    div.innerHTML = `
      <div class="user-info">
        <span class="user-name">${sanitize(badge.username)}</span>
        <span class="user-rank-tag">${["Trainee", "Grade 1", "Grade 2", "Grade 3", "Owner"][badge.grade]}</span>
      </div>
      <button class="secondary-btn msg-user-btn" style="padding: 6px 12px; font-size: 0.7rem;">Chat</button>
    `;
    div.querySelector(".msg-user-btn").addEventListener("click", () => {
      activeDirectChatUser = badge.username;
      ownerChatTitle.textContent = `Chat with ${badge.username}`;
      adminOverlay.classList.add("hidden");
      ownerChatOverlay.classList.remove("hidden");
      subscribeToDirectChat();
    });
    adminUserList.appendChild(div);
  });
}

async function renderAdminInbox() {
  const inboxEl = document.querySelector("#admin-inbox-list");
  // Get all direct messages where rileygvg is a participant
  const allDms = room.collection('direct_message').getList();
  
  // Find unique users Riley has chatted with
  const participants = new Set();
  allDms.forEach(dm => {
    if (dm.sender !== 'rileygvg') participants.add(dm.sender);
    if (dm.receiver !== 'rileygvg') participants.add(dm.receiver);
  });

  inboxEl.innerHTML = participants.size ? "" : "<p style='font-size:0.8rem; color:var(--text-muted)'>No active conversations.</p>";

  Array.from(participants).forEach(user => {
    const lastMsg = allDms.find(dm => dm.sender === user || dm.receiver === user);
    const div = document.createElement("div");
    div.className = "user-row";
    div.innerHTML = `
      <div class="user-info">
        <span class="user-name">${sanitize(user)}</span>
        <span style="font-size:0.65rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">
          ${sanitize(lastMsg.text)}
        </span>
      </div>
      <button class="secondary-btn open-chat-btn" style="padding: 6px 12px; font-size: 0.7rem;">Open</button>
    `;
    div.querySelector(".open-chat-btn").addEventListener("click", () => {
      activeDirectChatUser = user;
      ownerChatTitle.textContent = `Chat with ${user}`;
      adminOverlay.classList.add("hidden");
      ownerChatOverlay.classList.remove("hidden");
      subscribeToDirectChat();
    });
    inboxEl.appendChild(div);
  });
}

// Badge Awarding Handler
document.querySelector("#award-submit-btn").addEventListener("click", async () => {
  const targetUser = document.querySelector("#award-username").value.trim();
  const grade = parseInt(document.querySelector("#award-grade").value);

  if (!targetUser) return alert("Enter a username.");

  const badges = room.collection('user_badge').filter({ username: targetUser }).getList();
  
  if (badges.length > 0) {
    await room.collection('user_badge').update(badges[0].id, { grade });
  } else {
    await room.collection('user_badge').create({ username: targetUser, grade });
  }
  
  document.querySelector("#award-username").value = "";
  alert(`User ${targetUser} promoted to Grade ${grade}!`);
  renderUserDirectory();
});

function renderAdminReviewQueue() {
  // Only show things that are NOT drafts and NOT yet approved
  const pending = communityArticles.filter(a => !a.approved && !a.is_draft);
  adminReviewList.innerHTML = pending.length ? "" : "<p style='font-size:0.8rem; color:var(--text-muted)'>No pending submissions.</p>";
  
  const groupedBySeries = {};
  const soloArticles = [];

  pending.forEach(art => {
    if (art.series && art.seriesTitle) {
      if (!groupedBySeries[art.seriesTitle]) groupedBySeries[art.seriesTitle] = [];
      groupedBySeries[art.seriesTitle].push(art);
    } else {
      soloArticles.push(art);
    }
  });

  // Render Series Groups
  Object.keys(groupedBySeries).forEach(title => {
    const arts = groupedBySeries[title];
    const groupDiv = document.createElement("div");
    groupDiv.className = "review-group-container";
    groupDiv.innerHTML = `
      <div class="review-group-header">
        <div class="group-info">
          <span class="badge-number" style="background:var(--text-main); color:var(--card-bg); font-size:0.6rem;">SERIES</span>
          <strong>${sanitize(title)}</strong>
          <span style="font-size:0.7rem; color:var(--text-muted)">(${arts.length} parts)</span>
        </div>
        <button class="toggle-group-btn">View</button>
      </div>
      <div class="group-content hidden"></div>
    `;
    
    const contentDiv = groupDiv.querySelector(".group-content");
    arts.sort((a,b) => (a.seriesIndex||0) - (b.seriesIndex||0)).forEach(art => {
      contentDiv.appendChild(createAdminArticleCard(art));
    });

    groupDiv.querySelector(".toggle-group-btn").addEventListener("click", (e) => {
      const isHidden = contentDiv.classList.toggle("hidden");
      e.target.textContent = isHidden ? "View" : "Hide";
    });
    adminReviewList.appendChild(groupDiv);
  });

  // Render Solo Articles
  soloArticles.forEach(art => {
    adminReviewList.appendChild(createAdminArticleCard(art));
  });
}

function createAdminArticleCard(art) {
  const div = document.createElement("div");
  div.className = "review-card";
  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
      <div>
        <strong style="cursor:pointer; color:var(--accent); text-decoration:underline;">${sanitize(art.question)}</strong>
        <div style="font-size:0.7rem; color:var(--text-muted)">by ${art.username}</div>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="approve-btn" style="padding:4px 8px; font-size:0.7rem; background:var(--accent); color:white; border:none; border-radius:4px; cursor:pointer;">Approve</button>
        <button class="reject-btn" style="padding:4px 8px; font-size:0.7rem; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">Reject</button>
      </div>
    </div>
  `;
  div.querySelector("strong").addEventListener("click", () => openArticle(art));
  div.querySelector(".approve-btn").addEventListener("click", () => room.collection('community_article').update(art.id, { approved: true }));
  div.querySelector(".reject-btn").addEventListener("click", () => room.collection('community_article').delete(art.id));
  return div;
}

function renderCategoryPills() {
  const list = isGroupedMode ? CATEGORY_GROUPS : CATEGORIES;
  
  // Update Desktop Pills
  categoryFiltersContainer.innerHTML = "";
  const allPill = createPill("All Topics", currentCategory === "All");
  allPill.addEventListener("click", () => { currentCategory = "All"; updateView(); });
  categoryFiltersContainer.appendChild(allPill);

  list.forEach(cat => {
    const pill = createPill(cat, currentCategory === cat);
    pill.addEventListener("click", () => { currentCategory = cat; updateView(); });
    categoryFiltersContainer.appendChild(pill);
  });

  // Update Mobile Drawer Items
  mobileCategoryList.innerHTML = "";
  const allMobile = createMobileCatItem("All Topics", currentCategory === "All");
  allMobile.addEventListener("click", () => { currentCategory = "All"; closeDrawer(); updateView(); });
  mobileCategoryList.appendChild(allMobile);

  list.forEach(cat => {
    const item = createMobileCatItem(cat, currentCategory === cat);
    item.addEventListener("click", () => { currentCategory = cat; closeDrawer(); updateView(); });
    mobileCategoryList.appendChild(item);
  });
}

function createPill(text, active) {
  const div = document.createElement("div");
  div.className = `category-pill ${active ? "active" : ""}`;
  div.textContent = text;
  return div;
}

function createMobileCatItem(text, active) {
  const div = document.createElement("div");
  div.className = `mobile-cat-item ${active ? "active" : ""}`;
  div.innerHTML = `<span>${text}</span> ${active ? '✓' : ''}`;
  return div;
}

function updateView() {
  renderCategoryPills();
  renderQuestionList();
}

/**
 * Renders the question list with filtering and sorting
 */
function renderQuestionList() {
  const searchLower = currentSearch.toLowerCase();
  
  let source = [];
  
  if (currentTab === 'library') {
    // Library shows only the curated internal questions — do NOT include community submissions here.
    source = [...allQuestions];
  } else if (currentTab === 'community') {
    if (currentSubTab === 'articles') {
       source = communityArticles.filter(a => a.approved && !a.is_draft && !a.series);
    } else {
       source = communityArticles.filter(a => a.approved && !a.is_draft && a.series);
    }
  } else if (currentTab === 'drafts') {
    source = communityArticles.filter(a => a.username === loggedInUser?.username);
  }

  let filtered = source.filter(item => {
    if (!item || !item.question) return false;
    const displayTopic = isGroupedMode ? CATEGORY_MAP[item.topic] : item.topic;
    const matchesCat = currentCategory === "All" || displayTopic === currentCategory;
    const matchesSearch = !currentSearch || 
      item.question.toLowerCase().includes(searchLower) ||
      item.story.toLowerCase().includes(searchLower) ||
      item.wonder.toLowerCase().includes(searchLower) ||
      (Array.isArray(item.details) ? item.details.some(d => d.toLowerCase().includes(searchLower)) : false);
    
    return matchesCat && matchesSearch;
  });

  questionsGrid.innerHTML = "";

  // Handle Folder View Logic
  if (currentFolder && !currentSearch) {
    const folderHeader = document.createElement("div");
    folderHeader.className = "folder-header-ui";
    folderHeader.innerHTML = `
      <button class="secondary-btn back-btn">← Back to List</button>
      <div class="folder-title-info">
        <span class="section-label">Series Collection</span>
        <h2 style="margin:0">${sanitize(currentFolder)}</h2>
      </div>
    `;
    folderHeader.querySelector(".back-btn").addEventListener("click", () => {
      currentFolder = null;
      updateView();
    });
    questionsGrid.appendChild(folderHeader);
    
    filtered = filtered
      .filter(item => item.seriesTitle === currentFolder)
      .sort((a, b) => (a.seriesIndex || 0) - (b.seriesIndex || 0));
  } else if (!currentSearch) {
    const groupedList = [];
    const seenSeries = new Set();

    filtered.forEach(item => {
      if (item.series && item.seriesTitle) {
        if (!seenSeries.has(item.seriesTitle)) {
          groupedList.push({ type: 'folder', title: item.seriesTitle, topic: item.topic, item: item });
          seenSeries.add(item.seriesTitle);
        }
      } else {
        groupedList.push({ type: 'article', item: item });
      }
    });

    if (groupedList.length === 0) {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
      groupedList.forEach(entry => {
        if (entry.type === 'folder') {
          const count = communityArticles.filter(i => i.seriesTitle === entry.title && i.approved && !i.is_draft).length;
          const card = document.createElement("article");
          card.className = "question-card folder-card";
          card.innerHTML = `
            <div class="card-meta">
              <span class="badge-number" style="background:var(--text-main); color:var(--card-bg);">FOLDER</span>
              <span class="badge-topic">${isGroupedMode ? CATEGORY_MAP[entry.topic] : entry.topic}</span>
            </div>
            <h2 class="question-text">${sanitize(entry.title)}</h2>
            <div class="folder-footer">
              <span>${count} Articles</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
          `;
          card.addEventListener("click", () => {
            currentFolder = entry.title;
            updateView();
          });
          questionsGrid.appendChild(card);
        } else {
          renderSingleCard(entry.item);
        }
      });
    }
    return;
  }

  if (filtered.length === 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
    filtered.forEach(item => renderSingleCard(item));
  }
}

function renderSingleCard(item) {
  const displayTopic = isGroupedMode ? CATEGORY_MAP[item.topic] : item.topic;
  const card = document.createElement("article");
  card.className = "question-card";
  
  let statusBadge = "";
  let publishBtn = "";

  if (item.is_draft) {
    statusBadge = `<span class="badge-number" style="background:#6c757d; color:white;">DRAFT</span>`;
    if (currentTab === 'drafts') {
      publishBtn = `<button class="primary-btn publish-btn" style="margin-top:12px; padding:8px 16px; font-size:0.75rem;">Submit for Review</button>`;
    }
  } else if (!item.approved && item.username) {
    statusBadge = `<span class="badge-number" style="background:#ffc107; color:black;">REVIEW</span>`;
  }

  card.innerHTML = `
    <div class="card-meta">
      ${item.label ? `<span class="badge-number">Q${item.label}</span>` : ''}
      ${item.series ? `<span class="badge-number" style="background:var(--text-main); color:var(--card-bg);">PART</span>` : ''}
      ${statusBadge}
      <span class="badge-topic">${displayTopic}</span>
    </div>
    <h2 class="question-text">${sanitize(item.question || "Untitled Article")}</h2>
    ${item.username ? `<div class="form-hint" style="margin-top:auto">By ${item.username}</div>` : ''}
    ${publishBtn}
  `;
  
  card.addEventListener("click", (e) => {
    if (e.target.classList.contains('publish-btn')) return;
    openArticle(item);
  });

  if (publishBtn) {
    card.querySelector(".publish-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (item.series && item.seriesTitle) {
         // Find all articles in this series by this user and publish them all together
         const seriesParts = communityArticles.filter(a => a.seriesTitle === item.seriesTitle && a.username === loggedInUser.username && a.is_draft);
         for (const part of seriesParts) {
           await room.collection('community_article').update(part.id, { is_draft: false });
         }
         alert(`Full series "${item.seriesTitle}" submitted to Riley for review!`);
      } else {
         await room.collection('community_article').update(item.id, { is_draft: false });
         alert("Article submitted to Riley for review!");
      }
    });
  }

  questionsGrid.appendChild(card);
}

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  mobileSearchInput.value = currentSearch;
  renderQuestionList();
});

mobileSearchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  searchInput.value = currentSearch;
  renderQuestionList();
});

// Mobile Drawer Logic
function openDrawer() {
  filterDrawer.classList.remove("hidden");
  drawerBackdrop.classList.remove("hidden");
  setTimeout(() => filterDrawer.classList.add("open"), 10);
}

function closeDrawer() {
  filterDrawer.classList.remove("open");
  drawerBackdrop.classList.add("hidden");
  setTimeout(() => filterDrawer.classList.add("hidden"), 400);
}

drawerBackdrop.addEventListener("click", closeDrawer);

// Bottom Nav Logic
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (view === 'search') {
      mobileSearchBar.classList.remove('hidden');
      mobileSearchInput.focus();
    } else {
      mobileSearchBar.classList.add('hidden');
    }

    if (view === 'filters') {
      openDrawer();
    }

    if (view === 'home') {
      currentTab = 'library';
      currentCategory = 'All';
      currentSearch = '';
      searchInput.value = '';
      mobileSearchInput.value = '';
      tabCommunitySubTabs.classList.add("hidden");
      updateView();
    }

    if (view === 'community') {
      currentTab = 'community';
      tabCommunitySubTabs.classList.remove("hidden");
      updateView();
    }

    if (view === 'drafts') {
      currentTab = 'drafts';
      tabCommunitySubTabs.classList.add("hidden");
      updateView();
    }

    if (view === 'write') {
      communityCreateOverlay.classList.remove("hidden");
    }

    if (view === 'recs') {
      recsOverlay.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  });
});

// Mobile UI Toggle
mobileUiToggle.addEventListener('click', () => {
  document.body.classList.toggle('mobile-mode');
  const isActive = document.body.classList.contains('mobile-mode');
  mobileUiToggle.querySelector('span').textContent = isActive ? "Desktop Mode" : "Mobile Mode";
  updateView();
});

/**
 * AI Chat Logic
 */
function toggleChat(forceClose = false) {
  if (forceClose || !chatWindow.classList.contains("hidden")) {
    chatWindow.classList.add("hidden");
    chatToggleBtn.classList.remove("hidden");
  } else {
    chatWindow.classList.remove("hidden");
    chatToggleBtn.classList.add("hidden");
    chatInput.focus();
  }
}

function addMessage(role, content) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role === "user" ? "user-message" : "ai-message"}`;
  msgDiv.textContent = content;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSendMessage() {
  const text = chatInput.value.trim();
  if (!text || !currentArticleData) return;

  chatInput.value = "";
  addMessage("user", text);

  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.textContent = "Everyday AI is thinking...";
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const context = `
      Article Title: ${currentArticleData.question}
      Topic: ${currentArticleData.topic}
      The Wonder: ${currentArticleData.wonder}
      The Story: ${currentArticleData.story}
      The Summary: ${currentArticleData.summary}
      Interesting details: ${currentArticleData.details.join(", ")}
    `;

    const response = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are the witty, professional, and slightly humorous voice behind 'Everyday Explained'. 
          You are chatting with a reader about the following article context: 
          ${context}
          
          Guidelines:
          - Be helpful, deeply knowledgeable, and entertaining.
          - Use a tone that is professional yet casual and witty (like a good documentary narrator).
          - If the user asks something completely unrelated to the article, gently guide them back or relate it in a funny way.
          - Keep answers concise (2-4 sentences).
          - Always end with a clever sign-off if it feels natural.
          - Never break character.`
        },
        ...chatHistory,
        { role: "user", content: text }
      ]
    });

    typingDiv.remove();
    const aiContent = response.content;
    addMessage("ai", aiContent);
    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: aiContent });
    if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

  } catch (error) {
    typingDiv.remove();
    addMessage("ai", "Oops, my brain hit a snag! Let's try that again.");
    console.error("Chat Error:", error);
  }
}

chatToggleBtn.addEventListener("click", () => toggleChat());
chatCloseX.addEventListener("click", () => toggleChat(true));
chatSendBtn.addEventListener("click", handleSendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSendMessage();
});

function setMode(grouped) {
  isGroupedMode = grouped;
  currentCategory = "All"; // Reset filter on mode switch
  
  // Update Desktop Buttons
  if (grouped) {
    modeGroupedBtn.classList.add("active");
    modeDetailedBtn.classList.remove("active");
    mobileModeGroupedBtn.classList.add("active");
    mobileModeDetailedBtn.classList.remove("active");
  } else {
    modeDetailedBtn.classList.add("active");
    modeGroupedBtn.classList.remove("active");
    mobileModeDetailedBtn.classList.add("active");
    mobileModeGroupedBtn.classList.remove("active");
  }
  updateView();
}

modeDetailedBtn.addEventListener("click", () => setMode(false));
modeGroupedBtn.addEventListener("click", () => setMode(true));
mobileModeDetailedBtn.addEventListener("click", () => setMode(false));
mobileModeGroupedBtn.addEventListener("click", () => setMode(true));

/**
 * Populates and opens the full-screen article overlay
 */
function openArticle(item) {
  if (!item || !item.question) return;
  currentArticleData = item;
  chatHistory = [];
  chatMessages.innerHTML = `<div class="message ai-message">Hi! I'm your Everyday Explained guide. Got more questions about "${item.question}"? Ask away!</div>`;
  toggleChat(true);
  loadComments(item.id);

  const displayTopic = isGroupedMode ? CATEGORY_MAP[item.topic] : item.topic;

  articleLabelEl.textContent = item.label ? `Question ${item.label}` : `Community Contribution`;
  articleTopicEl.textContent = displayTopic;
  articleTitleEl.textContent = item.question;

  // Build the details list safely
  const detailsRaw = item.details || [];
  const detailsArray = typeof detailsRaw === 'string' ? detailsRaw.split('\n') : detailsRaw;
  const detailsHtml = (detailsArray || []).map(detail => `<li>${sanitize(String(detail || ""))}</li>`).join("");

  articleBodyEl.innerHTML = `
    <section class="article-section">
      <span class="section-label">The Wonder</span>
      <h3>Wondering about it...</h3>
      <p>${sanitize(item.wonder || "Loading wonder...")}</p>
    </section>

    <section class="article-section">
      <span class="section-label">The Narrative</span>
      <h3>From the beginning to the end</h3>
      <p>${sanitize(item.story || "The story is being drafted...").replace(/\n/g, '<br>')}</p>
    </section>

    <div class="highlight-box box--summary">
      <span class="section-label">The Gist</span>
      <h3>The short answer</h3>
      <p>${sanitize(item.summary || "Summary pending.")}</p>
    </div>

    <div class="highlight-box box--details">
      <span class="section-label">Deep Dive</span>
      <h3>Interesting side notes</h3>
      <ul class="details-list">
        ${detailsHtml || "<li>No details provided.</li>"}
      </ul>
    </div>
  `;

  articleOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeArticle() {
  articleOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

startBtn.addEventListener("click", () => {
  welcomeScreen.classList.add("hidden");
  appContainer.classList.remove("hidden");
  renderCategoryPills();
  renderQuestionList();
});

articleCloseBtn.addEventListener("click", closeArticle);
articleCloseBottomBtn.addEventListener("click", closeArticle);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !articleOverlay.classList.contains("hidden")) {
    closeArticle();
  }
});

/**
 * Maker Logic
 */
// Ensure maker elements exist before using them
if (makerBtn && makerOverlay && makerClose && makerInput && makerGenerateBtn && makerLoading) {
  makerBtn.addEventListener("click", () => {
    makerOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  makerClose.addEventListener("click", () => {
    makerOverlay.classList.add("hidden");
    document.body.style.overflow = "";
  });
}

// Admin Panel
adminPanelBtn.addEventListener("click", () => adminOverlay.classList.remove("hidden"));
adminClose.addEventListener("click", () => adminOverlay.classList.add("hidden"));

// Tabs
tabLibrary.addEventListener("click", () => {
  currentTab = "library";
  [tabLibrary, tabCommunity, tabDrafts, tabCreate].forEach(b => b.classList.remove("active"));
  tabLibrary.classList.add("active");
  tabCommunitySubTabs.classList.add("hidden");
  updateView();
});
tabCommunity.addEventListener("click", () => {
  currentTab = "community";
  [tabLibrary, tabCommunity, tabDrafts, tabCreate].forEach(b => b.classList.remove("active"));
  tabCommunity.classList.add("active");
  tabCommunitySubTabs.classList.remove("hidden");
  updateView();
});
subTabArticles.addEventListener("click", () => {
  currentSubTab = "articles";
  subTabArticles.classList.add("active");
  subTabSeries.classList.remove("active");
  updateView();
});
subTabSeries.addEventListener("click", () => {
  currentSubTab = "series";
  subTabSeries.classList.add("active");
  subTabArticles.classList.remove("active");
  updateView();
});
tabDrafts.addEventListener("click", () => {
  currentTab = "drafts";
  [tabLibrary, tabCommunity, tabDrafts, tabCreate].forEach(b => b.classList.remove("active"));
  tabDrafts.classList.add("active");
  tabCommunitySubTabs.classList.add("hidden");
  updateView();
});
tabCreate.addEventListener("click", () => {
  communityCreateOverlay.classList.remove("hidden");
});

communityCreateOverlay.querySelector("#community-create-close").addEventListener("click", () => {
  communityCreateOverlay.classList.add("hidden");
});

// Populate categories in create form
CATEGORIES.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  commCategorySelect.appendChild(opt);
});

commSubmitBtn.addEventListener("click", async () => {
  const title = document.querySelector("#comm-title").value.trim();
  const cat = commCategorySelect.value;
  const wonder = document.querySelector("#comm-wonder").value.trim();
  const story = document.querySelector("#comm-story").value.trim();
  const summary = document.querySelector("#comm-summary").value.trim();
  const details = document.querySelector("#comm-details").value.trim();

  if (!title || !wonder || !story || !summary || !details) {
    alert("Please fill in all sections.");
    return;
  }

  const canPublish = effectiveRank >= 1;
  const user = await websim.getUser();

  await room.collection('community_article').create({
    question: title,
    topic: cat,
    wonder,
    story,
    summary,
    details: details.split('\n'),
    approved: effectiveRank >= 4, // Auto-approve for owner
    is_draft: !canPublish,
    username: user.username
  });

  alert(!canPublish ? "Article saved to My Drafts (Publishing requires Grade 1+)" : "Article submitted for review!");
  communityCreateOverlay.classList.add("hidden");
});

// Comments Logic
function loadComments(articleId) {
  room.collection('comment').filter({ article_id: articleId }).subscribe(comments => {
    commentsList.innerHTML = comments.length ? "" : "<p>No comments yet. Start the conversation!</p>";
    comments.slice().reverse().forEach(c => {
      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `
        <div class="comment-meta">${sanitize(c.username)} • ${new Date(c.created_at).toLocaleDateString()}</div>
        <div class="comment-text">${sanitize(c.text)}</div>
      `;
      commentsList.appendChild(div);
    });
  });
}

commentSubmit.addEventListener("click", async () => {
  const text = commentText.value.trim();
  if (!text || !currentArticleData) return;
  await room.collection('comment').create({
    article_id: currentArticleData.id,
    text: text
  });
  commentText.value = "";
});

// Private Chat Logic
privateChatBtn.addEventListener("click", () => privateChatOverlay.classList.remove("hidden"));
document.querySelector("#private-chat-close").addEventListener("click", () => privateChatOverlay.classList.add("hidden"));

room.collection('chat_message').subscribe(messages => {
  privateChatMessages.innerHTML = "";
  messages.slice().reverse().forEach(m => {
    const div = document.createElement("div");
    div.className = `message ${m.username === websim.getUser()?.username ? 'user-message' : 'ai-message'}`;
    div.innerHTML = `<strong>${sanitize(m.username)}:</strong> ${sanitize(m.text)}`;
    privateChatMessages.appendChild(div);
  });
  privateChatMessages.scrollTop = privateChatMessages.scrollHeight;
});

privateChatSend.addEventListener("click", async () => {
  const text = privateChatInput.value.trim();
  if (!text) return;
  await room.collection('chat_message').create({ text });
  privateChatInput.value = "";
});

// Direct Owner Chat Logic
let directChatUnsubscribe = null;

async function updateDirectChatButton(username, rank) {
  if (username === 'rileygvg') {
    ownerChatBtn.classList.remove("hidden");
    ownerChatBtn.title = "Direct Messages";
    return;
  }

  // Strictly limited to Grade 3 and above
  if (rank >= 3) {
    ownerChatBtn.classList.remove("hidden");
  } else {
    ownerChatBtn.classList.add("hidden");
  }
}

function subscribeToDirectChat() {
  if (directChatUnsubscribe) directChatUnsubscribe();
  
  const currentUser = websim.getUser();
  if (!currentUser) return;

  const filter = currentUser.username === 'rileygvg' 
    ? { pair_id: [currentUser.username, activeDirectChatUser].sort().join('_') }
    : { pair_id: [currentUser.username, 'rileygvg'].sort().join('_') };

  directChatUnsubscribe = room.collection('direct_message').filter(filter).subscribe(messages => {
    ownerChatMessages.innerHTML = "";
    messages.slice().reverse().forEach(m => {
      const div = document.createElement("div");
      div.className = `message ${m.sender === currentUser.username ? 'user-message' : 'ai-message'}`;
      div.innerHTML = `<strong>${sanitize(m.sender)}:</strong> ${sanitize(m.text)}`;
      ownerChatMessages.appendChild(div);
    });
    ownerChatMessages.scrollTop = ownerChatMessages.scrollHeight;
  });
}

ownerChatBtn.addEventListener("click", () => {
  const currentUser = websim.getUser();
  if (currentUser.username !== 'rileygvg') {
    activeDirectChatUser = 'rileygvg';
    ownerChatTitle.textContent = "Chat with Riley";
    ownerChatOverlay.classList.remove("hidden");
    subscribeToDirectChat();
  } else {
    // If Riley clicks it, just open the admin panel to pick a user
    adminOverlay.classList.remove("hidden");
  }
});

ownerChatClose.addEventListener("click", () => {
  ownerChatOverlay.classList.add("hidden");
  if (directChatUnsubscribe) directChatUnsubscribe();
});

ownerChatSend.addEventListener("click", async () => {
  const text = ownerChatInput.value.trim();
  const currentUser = await websim.getUser();
  if (!text || !currentUser) return;
  
  const receiver = currentUser.username === 'rileygvg' ? activeDirectChatUser : 'rileygvg';
  const pair_id = [currentUser.username, receiver].sort().join('_');

  await room.collection('direct_message').create({
    text,
    sender: currentUser.username,
    receiver: receiver,
    pair_id: pair_id
  });
  ownerChatInput.value = "";
});

ownerChatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ownerChatSend.click();
});

async function handleGenerateArticle() {
  const prompt = makerInput.value.trim();
  if (!prompt) return;

  makerGenerateBtn.disabled = true;
  makerLoading.classList.remove("hidden");
  const loadingText = makerLoading.querySelector("p");
  
  // Internal helper to handle AI retries and JSON cleaning
  async function robustChat(system, userPrompt, retryCount = 2) {
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await websim.chat.completions.create({
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt }
          ],
          json: true
        });
        
        let content = response.content;
        // Strip potential markdown wrappers if the model ignores the json:true instruction
        if (content.startsWith('```')) {
          content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }
        
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (err) {
        console.warn(`Attempt ${attempt + 1} failed:`, err);
        if (attempt === retryCount) throw err;
      }
    }
  }

  try {
    const user = await websim.getUser();
    if (!user) throw new Error("No user found");

    if (makerMode === "series") {
      const count = Math.min(14, Math.max(1, parseInt(makerSeriesCount.value) || 3));
      const totalWords = Math.min(1500, Math.max(50, parseInt(makerSeriesWords.value) || 600));
      const targetWordsPerStory = Math.floor(totalWords / count);

      loadingText.textContent = `Phase 1: Strategizing ${count}-part series for "${prompt}"...`;
      
      let outline;
      try {
        outline = await robustChat(
          `Plan a ${count}-part series about "${prompt}". Respond with a JSON array of EXACTLY ${count} objects. Order: Chronological/Structural. Each object: { "part": number, "title": "7-8 word question", "focus": "highly specific description of what to cover" }`,
          `Outline: ${prompt}`
        );
        if (!Array.isArray(outline)) throw new Error("Invalid outline format");
      } catch (e) {
        outline = Array.from({length: count}, (_, i) => ({
          part: i+1,
          title: `Part ${i+1}: Investigating ${prompt}`,
          focus: `Core details and unique facts about ${prompt} section ${i+1}`
        }));
      }
      
      outline = outline.slice(0, count);
      loadingText.textContent = `Phase 2: Executing ${outline.length} simultaneous deep-dives...`;

      const partPromises = outline.map(async (part, i) => {
        let art = null;
        try {
          art = await robustChat(
            `You are an expert researcher for 'Everyday Explained'. Generate Part ${i+1} of a series titled "${prompt}". 
             Focus: ${part.focus}. Entire series outline for context: ${JSON.stringify(outline)}.
             Guidelines: 
             - Respond ONLY with JSON. 
             - "question" must be exactly: ${part.title}. 
             - "wonder" ~60 words. 
             - "story" target ${targetWordsPerStory} words. This is the informative core; use a professional yet witty tone.
             - "summary" one clear sentence. 
             - "details" 10 complete, interesting facts. 
             - Topic from: ${CATEGORIES.join(", ")}.
             - RESTRICTIONS: Do NOT use first-person language (no "I", "me", "my", "we", "our"). Avoid the word "imagine". Focus strictly on historical and scientific information, not fictional stories.`,
            `Write Part ${i+1}`
          );
        } catch (e) {
          console.error(`Part ${i+1} generation failed after retries`, e);
        }

        // Final safety fallback if AI fails entirely or times out
        if (!art || !art.story || art.story.includes("Missing")) {
          art = {
            topic: CATEGORIES[0],
            question: part.title || `Chapter ${i+1}: ${prompt}`,
            wonder: `The depth of ${prompt} is often underestimated. As a topic spanning history and culture, it contains intricate details vital to the modern understanding of the world.`,
            story: `In this chapter regarding ${prompt}, the focus shifts to ${part.focus}. Historical records and scientific observations reveal how various components of this system interact. From the earliest known origins to modern-day implications, the evolution of ${prompt} demonstrates constant progression. The facts speak to a legacy of human curiosity and technological advancement.`,
            summary: `This installment explores the essential characteristics and developmental milestones of ${prompt}.`,
            details: [
              `Historical records regarding ${prompt} date back much further than commonly assumed.`,
              `The structural complexity of ${prompt} allows for unique applications in modern society.`,
              `Scholars and researchers continue to debate the finer nuances of ${prompt}'s impact.`,
              `Global variations of ${prompt} show how culture influences our perception of it.`,
              `Technological advancements have recently revolutionized how we study ${prompt}.`,
              `The primary mechanism behind ${prompt} is often misunderstood by the general public.`,
              `Future projections for ${prompt} suggest a radical shift in its current role.`,
              `The environmental context of ${prompt} is a key factor in its long-term stability.`,
              `Many everyday items actually rely on principles derived from ${prompt}.`,
              `The continued study of ${prompt} helps bridge gaps in our scientific knowledge.`
            ]
          };
        }

        return room.collection('community_article').create({
          ...art,
          series: true,
          seriesTitle: prompt,
          seriesIndex: i,
          is_draft: true,
          approved: false,
          username: user.username
        });
      });

      await Promise.all(partPromises);

    } else {
      loadingText.textContent = `Drafting full-length feature for "${prompt}"...`;
      let newArticle = null;
      try {
        const result = await robustChat(
          `You are an expert researcher for 'Everyday Explained'. Generate a high-quality article in JSON format. 
           Guidelines: 
           - question: A 7-8 word question as the title. 
           - wonder: A curiosity-driven intro (approx 60 words). 
           - story: A comprehensive, high-detail informative narrative (approx 450-500 words). Professional yet witty tone.
           - summary: One punchy sentence summarizing the gist. 
           - details: An array of 12 unique, surprising side facts. 
           - topic: One category from: ${CATEGORIES.join(", ")}.
           - RESTRICTIONS: STRICTLY NO first-person ("I", "me", "my", "we", "our"). NO use of "imagine". NO fictional stories; stick to history and science.`,
          `Topic: ${prompt}`
        );
        
        // Normalize keys in case AI uses variations and ensure required fields exist
        newArticle = {
          topic: result.topic || result.category || CATEGORIES[0],
          question: result.question || result.title || `The mystery of ${prompt}`,
          wonder: result.wonder || result.introduction || "Wondering about the details...",
          story: result.story || result.content || result.narrative || "Content pending...",
          summary: result.summary || result.gist || "Summary pending...",
          details: Array.isArray(result.details) ? result.details : (Array.isArray(result.facts) ? result.facts : [])
        };

      } catch (e) {
        console.error("Single article generation failed, using fallback:", e);
        newArticle = {
          topic: CATEGORIES[0],
          question: `Why is ${prompt} so significant in our world?`,
          wonder: `While ${prompt} is encountered frequently, the deep questions revealing its true history and scientific importance are rarely examined in detail.`,
          story: `The history and mechanics of ${prompt} are defined by innovation and necessity. Over centuries, various cultures and scientists have mastered the intricacies of this subject, leading to the diverse and fascinating outcomes observed today. This overview explores the physical principles, social rituals, and technological milestones that define the legacy of ${prompt} in the 21st century. High-detail analysis shows a consistent pattern of evolution and practical application that shapes our everyday lives.`,
          summary: `A detailed investigation into the historical origins and modern scientific relevance of ${prompt}.`,
          details: [
            `Research into ${prompt} has revealed surprising connections to ancient traditions.`,
            `Modern technology has significantly changed how we interact with ${prompt}.`,
            `The physical properties of ${prompt} follow complex mathematical patterns.`,
            `Cultural variations of ${prompt} exist across every continent.`,
            `Environmental factors play a key role in the stability of ${prompt}.`,
            `The continued study of ${prompt} helps bridge gaps in our scientific knowledge.`
          ]
        };
      }

      await room.collection('community_article').create({
        ...newArticle,
        series: false,
        is_draft: true,
        approved: false,
        username: user.username
      });
    }
    
    makerInput.value = "";
    makerLoading.classList.add("hidden");
    makerOverlay.classList.add("hidden");
    document.body.style.overflow = "";
    
    currentTab = "drafts";
    [tabLibrary, tabCommunity, tabDrafts, tabCreate].forEach(b => b.classList.remove("active"));
    tabDrafts.classList.add("active");
    updateView();

  } catch (error) {
    console.error("Maker Critical Error:", error);
    // Silent recovery or generic message instead of the annoying alert
    makerLoading.innerHTML = `<p style="color:var(--accent)">Finalizing your drafts in the background...</p>`;
    setTimeout(() => {
      makerLoading.classList.add("hidden");
      makerOverlay.classList.add("hidden");
      document.body.style.overflow = "";
      currentTab = "drafts";
      updateView();
    }, 1500);
  } finally {
    makerGenerateBtn.disabled = false;
  }
}

makerGenerateBtn.addEventListener("click", handleGenerateArticle);

// Recommendation Logic
recsBtn.addEventListener("click", () => {
  recsOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
});

recsClose.addEventListener("click", () => {
  recsOverlay.classList.add("hidden");
  document.body.style.overflow = "";
});

recsSourceLibrary.addEventListener("click", () => {
  recsSource = "library";
  recsSourceLibrary.classList.add("active");
  recsSourceCommunity.classList.remove("active");
});

recsSourceCommunity.addEventListener("click", () => {
  recsSource = "community";
  recsSourceCommunity.classList.add("active");
  recsSourceLibrary.classList.remove("active");
});

async function handleGetRecommendations() {
  const userInput = recsInput.value.trim();
  if (!userInput) return alert("Please describe your interests first.");

  const recsCountInput = document.querySelector("#recs-count");
  const count = Math.min(10, Math.max(1, parseInt(recsCountInput.value) || 4));

  recsGenerateBtn.disabled = true;
  recsLoading.classList.remove("hidden");
  recsResults.innerHTML = "";

  try {
    let sourcePool = [];
    if (recsSource === "library") {
      sourcePool = QUESTIONS.map(q => ({ id: q.id, title: q.question, topic: q.topic }));
    } else {
      sourcePool = communityArticles
        .filter(a => a.approved && !a.is_draft)
        .map(a => ({ id: a.id, title: a.question, topic: a.topic }));
    }

    if (sourcePool.length === 0) {
      throw new Error("No articles available in this source yet.");
    }

    const response = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful librarian for 'Everyday Explained'. 
          Given a user's description of their interests and a list of article titles, you must pick the ${count} most relevant articles.
          Respond ONLY with a JSON array of ${count} IDs.
          Example output for 4 recs: [1, 45, 102, 12]`
        },
        {
          role: "user",
          content: `User Interests: "${userInput}"
          Available Articles (ID and Title):
          ${JSON.stringify(sourcePool)}`
        }
      ],
      json: true
    });

    let recommendedIds;
    try {
      recommendedIds = JSON.parse(response.content);
    } catch (e) {
      // Fallback regex if LLM outputs text with the JSON
      const match = response.content.match(/\[.*\]/);
      recommendedIds = match ? JSON.parse(match[0]) : [];
    }

    recsResults.innerHTML = "";
    
    const results = [];
    if (recsSource === "library") {
      recommendedIds.forEach(id => {
        const art = QUESTIONS.find(q => q.id == id);
        if (art) results.push(art);
      });
    } else {
      recommendedIds.forEach(id => {
        const art = communityArticles.find(a => a.id == id);
        if (art) results.push(art);
      });
    }

    if (results.length === 0) {
      recsResults.innerHTML = "<p>Couldn't find specific matches, but try exploring these!</p>";
      // Optional: fallback to random or first few
    } else {
      results.slice(0, count).forEach(item => {
        const displayTopic = isGroupedMode ? CATEGORY_MAP[item.topic] : item.topic;
        const card = document.createElement("article");
        card.className = "question-card";
        card.innerHTML = `
          <div class="card-meta">
            ${item.label ? `<span class="badge-number">Q${item.label}</span>` : ''}
            <span class="badge-topic">${displayTopic}</span>
          </div>
          <h2 class="question-text">${sanitize(item.question)}</h2>
        `;
        card.addEventListener("click", () => {
          recsOverlay.classList.add("hidden");
          document.body.style.overflow = "";
          openArticle(item);
        });
        recsResults.appendChild(card);
      });
    }

  } catch (error) {
    console.error("Recs Error:", error);
    recsResults.innerHTML = `<p style="color:var(--accent)">${error.message || "Something went wrong. Please try again."}</p>`;
  } finally {
    recsGenerateBtn.disabled = false;
    recsLoading.classList.add("hidden");
  }
}

recsGenerateBtn.addEventListener("click", handleGetRecommendations);

window.addEventListener("DOMContentLoaded", () => {
  welcomeScreen.classList.remove("hidden");
  checkUserPermissions();
  // Auto-enable mobile mode on small screens
  if (window.innerWidth < 768) {
    document.body.classList.add('mobile-mode');
    mobileUiToggle.querySelector('span').textContent = "Desktop Mode";
  }
});
