// Dashboard functionality
class DashboardManager {
  constructor() {
    this.currentUser = {
      name: "Lorem Ipsum User",
      role: "admin",
      permissions: ["manage_users", "approve_tasks", "view_history", "manage_permissions"],
    }

    this.pendingTasks = [
      {
        id: 1,
        title: "Database Update Request",
        description: "User John Doe has requested to update apple variety information",
        type: "database_update",
        status: "pending",
        submittedBy: "John Doe",
        submittedAt: "2025-06-04 08:30:00",
      },
      {
        id: 2,
        title: "New User Registration",
        description: "Jane Smith has applied for researcher access",
        type: "user_registration",
        status: "pending",
        submittedBy: "Jane Smith",
        submittedAt: "2025-06-04 07:15:00",
      },
      {
        id: 3,
        title: "Permission Upgrade Request",
        description: "Bob Wilson requests admin privileges for regional database",
        type: "permission_upgrade",
        status: "pending",
        submittedBy: "Bob Wilson",
        submittedAt: "2025-06-03 16:45:00",
      },
    ]

    this.users = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "researcher",
        status: "active",
        lastLogin: "2025-06-04 09:00:00",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "viewer",
        status: "pending",
        lastLogin: "Never",
      },
      {
        id: 3,
        name: "Bob Wilson",
        email: "bob.wilson@example.com",
        role: "researcher",
        status: "active",
        lastLogin: "2025-06-03 14:30:00",
      },
    ]

    this.searchHistory = [
      {
        query: "Honeycrisp apple varieties",
        user: "John Doe",
        timestamp: "2025-06-04 08:45:00",
        results: 23,
      },
      {
        query: "Disease resistant apples",
        user: "Jane Smith",
        timestamp: "2025-06-04 07:30:00",
        results: 45,
      },
      {
        query: "Heritage apple cultivars",
        user: "Bob Wilson",
        timestamp: "2025-06-03 16:20:00",
        results: 12,
      },
    ]

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateNotificationBadge()
    this.loadSessionInfo()
  }

  setupEventListeners() {
    // Action card click handlers
    document.querySelectorAll(".action-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const action = card.dataset.action
        this.handleActionClick(action)
      })
    })

    // Modal close handlers
    const modal = document.getElementById("actionModal")
    const closeBtn = document.querySelector(".close")

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  }

  handleActionClick(action) {
    switch (action) {
      case "manage-permissions":
        this.showManagePermissions()
        break
      case "create-user":
        this.showCreateUser()
        break
      case "search-history":
        this.showSearchHistory()
        break
      case "approve-tasks":
        this.showApproveTasks()
        break
    }
  }

  showModal(title, content) {
    const modal = document.getElementById("actionModal")
    const modalBody = document.getElementById("modalBody")

    modalBody.innerHTML = `
      <h2>${title}</h2>
      ${content}
    `

    modal.style.display = "block"
  }

  showManagePermissions() {
    const content = `
      <div class="modal-form">
        <h3>User Management</h3>
        <div class="user-list">
          ${this.users
            .map(
              (user) => `
            <div class="user-item">
              <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-role">Role: ${user.role} | Status: ${user.status}</div>
                <div class="user-role">Last Login: ${user.lastLogin}</div>
              </div>
              <div class="user-actions">
                <button class="btn btn-primary btn-small" onclick="dashboard.promoteUser(${user.id})">
                  Promote
                </button>
                <button class="btn btn-secondary btn-small" onclick="dashboard.demoteUser(${user.id})">
                  Demote
                </button>
                <button class="btn btn-danger btn-small" onclick="dashboard.suspendUser(${user.id})">
                  Suspend
                </button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `

    this.showModal("Manage Systems Permission", content)
  }

  showCreateUser() {
    const content = `
      <form class="modal-form" onsubmit="dashboard.createUser(event)">
        <div class="form-group">
          <label for="userName">Full Name</label>
          <input type="text" id="userName" name="userName" required>
        </div>
        
        <div class="form-group">
          <label for="userEmail">Email Address</label>
          <input type="email" id="userEmail" name="userEmail" required>
        </div>
        
        <div class="form-group">
          <label for="userRole">Role</label>
          <select id="userRole" name="userRole" required>
            <option value="">Select Role</option>
            <option value="viewer">Viewer</option>
            <option value="researcher">Researcher</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="userDepartment">Department</label>
          <input type="text" id="userDepartment" name="userDepartment">
        </div>
        
        <div class="form-group">
          <label for="userNotes">Notes</label>
          <textarea id="userNotes" name="userNotes" placeholder="Additional information about the user..."></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('actionModal').style.display='none'">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            Create User
          </button>
        </div>
      </form>
    `

    this.showModal("Create New User Account", content)
  }

  showSearchHistory() {
    const content = `
      <div class="search-history">
        <h3>Recent Search Activity</h3>
        ${this.searchHistory
          .map(
            (search) => `
          <div class="search-item">
            <div>
              <div class="search-query">"${search.query}"</div>
              <div class="search-date">by ${search.user} - ${search.timestamp} (${search.results} results)</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" onclick="dashboard.exportSearchHistory()">
          Export History
        </button>
        <button class="btn btn-secondary" onclick="dashboard.clearSearchHistory()">
          Clear History
        </button>
      </div>
    `

    this.showModal("View Search History", content)
  }

  showApproveTasks() {
    const content = `
      <div class="task-list">
        <h3>Pending Approval Tasks</h3>
        ${this.pendingTasks
          .map(
            (task) => `
          <div class="task-item">
            <div class="task-header">
              <div class="task-title">${task.title}</div>
              <div class="task-status status-pending">PENDING</div>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
              <small>Submitted by: ${task.submittedBy} on ${task.submittedAt}</small>
            </div>
            <div class="task-actions">
              <button class="btn btn-primary btn-small" onclick="dashboard.approveTask(${task.id})">
                Approve
              </button>
              <button class="btn btn-danger btn-small" onclick="dashboard.rejectTask(${task.id})">
                Reject
              </button>
              <button class="btn btn-secondary btn-small" onclick="dashboard.viewTaskDetails(${task.id})">
                View Details
              </button>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `

    this.showModal("Approve Tasks", content)
  }

  // User management functions
  promoteUser(userId) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      if (user.role === "viewer") user.role = "researcher"
      else if (user.role === "researcher") user.role = "admin"

      this.showMessage(`${user.name} has been promoted to ${user.role}`, "success")
      this.showManagePermissions() // Refresh the view
    }
  }

  demoteUser(userId) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      if (user.role === "admin") user.role = "researcher"
      else if (user.role === "researcher") user.role = "viewer"

      this.showMessage(`${user.name} has been demoted to ${user.role}`, "warning")
      this.showManagePermissions() // Refresh the view
    }
  }

  suspendUser(userId) {
    const user = this.users.find((u) => u.id === userId)
    if (user) {
      user.status = user.status === "active" ? "suspended" : "active"
      this.showMessage(`${user.name} has been ${user.status}`, user.status === "suspended" ? "warning" : "success")
      this.showManagePermissions() // Refresh the view
    }
  }

  // Task management functions
  approveTask(taskId) {
    const taskIndex = this.pendingTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.pendingTasks[taskIndex]
      this.pendingTasks.splice(taskIndex, 1)
      this.showMessage(`Task "${task.title}" has been approved`, "success")
      this.updateNotificationBadge()
      this.showApproveTasks() // Refresh the view
    }
  }

  rejectTask(taskId) {
    const taskIndex = this.pendingTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      const task = this.pendingTasks[taskIndex]
      this.pendingTasks.splice(taskIndex, 1)
      this.showMessage(`Task "${task.title}" has been rejected`, "error")
      this.updateNotificationBadge()
      this.showApproveTasks() // Refresh the view
    }
  }

  viewTaskDetails(taskId) {
    const task = this.pendingTasks.find((t) => t.id === taskId)
    if (task) {
      alert(
        `Task Details:\n\nTitle: ${task.title}\nType: ${task.type}\nSubmitted by: ${task.submittedBy}\nDate: ${task.submittedAt}\n\nDescription: ${task.description}`,
      )
    }
  }

  // User creation
  createUser(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const userData = {
      id: this.users.length + 1,
      name: formData.get("userName"),
      email: formData.get("userEmail"),
      role: formData.get("userRole"),
      status: "active",
      lastLogin: "Never",
    }

    this.users.push(userData)
    this.showMessage(`User ${userData.name} has been created successfully`, "success")
    document.getElementById("actionModal").style.display = "none"
  }

  // Search history functions
  exportSearchHistory() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Query,User,Timestamp,Results\n" +
      this.searchHistory
        .map((search) => `"${search.query}","${search.user}","${search.timestamp}",${search.results}`)
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "search_history.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    this.showMessage("Search history exported successfully", "success")
  }

  clearSearchHistory() {
    if (confirm("Are you sure you want to clear all search history? This action cannot be undone.")) {
      this.searchHistory = []
      this.showMessage("Search history cleared", "warning")
      this.showSearchHistory() // Refresh the view
    }
  }

  // Utility functions
  updateNotificationBadge() {
    const badge = document.querySelector(".notification-badge")
    if (badge) {
      badge.textContent = this.pendingTasks.length
      badge.style.display = this.pendingTasks.length > 0 ? "flex" : "none"
    }
  }

  loadSessionInfo() {
    // Update session information with current user data
    const sessionItems = document.querySelectorAll(".session-value")
    if (sessionItems.length >= 4) {
      sessionItems[0].textContent = `Active session for ${this.currentUser.name} - Administrator access`
      sessionItems[1].textContent = `Last login: June 4, 2025 at 8:00 AM EST`
      sessionItems[2].textContent = `Session status: Active and secure - expires in 4 hours`
      sessionItems[3].textContent = `User Permissions: Full administrative access including user management, database modifications, and system configuration`
    }
  }

  showMessage(message, type) {
    // Create and show a temporary message
    const messageDiv = document.createElement("div")
    messageDiv.className = `message message-${type}`
    messageDiv.textContent = message

    const container = document.querySelector(".dashboard-container")
    container.insertBefore(messageDiv, container.firstChild)

    setTimeout(() => {
      messageDiv.remove()
    }, 5000)
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new DashboardManager()

  // Add fade-in animation
  document.querySelector(".dashboard-main").classList.add("fade-in")
})

// Additional interactive features
document.addEventListener("DOMContentLoaded", () => {
  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "1":
          e.preventDefault()
          document.querySelector('[data-action="manage-permissions"]').click()
          break
        case "2":
          e.preventDefault()
          document.querySelector('[data-action="create-user"]').click()
          break
        case "3":
          e.preventDefault()
          document.querySelector('[data-action="search-history"]').click()
          break
        case "4":
          e.preventDefault()
          document.querySelector('[data-action="approve-tasks"]').click()
          break
      }
    }
  })

  // Add tooltips to action cards
  const actionCards = document.querySelectorAll(".action-card")
  actionCards.forEach((card, index) => {
    card.title = `Keyboard shortcut: Ctrl+${index + 1}`
  })

  // Add loading states to buttons
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn") && !e.target.classList.contains("btn-secondary")) {
      e.target.classList.add("loading")
      setTimeout(() => {
        e.target.classList.remove("loading")
      }, 1000)
    }
  })
})
