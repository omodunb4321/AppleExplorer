class UserManagementSystem {
  constructor() {
    this.users = [];
    this.currentUser = {
      id: 'current_user',
      name: 'Senior Administrator',
      role: 'Senior Member',
      email: 'admin@agr.gc.ca',
      permissions: {
        create: true,
        upload: true,
        update: true,
        admin: true
      }
    };
    this.filteredUsers = [];
    this.pendingChanges = new Map();
    this.userToDelete = null;
    
    this.init();
  }

  init() {
    this.loadSampleData();
    this.bindEvents();
    this.renderUsers();
    this.updateCurrentUserDisplay();
  }

  loadSampleData() {
    // Sample users with recovery account at top
    this.users = [
      {
        id: 'recovery_001',
        name: 'System Recovery Account',
        role: 'Recovery Account',
        email: 'recovery@agr.gc.ca',
        department: 'System Administration',
        permissions: {
          create: false,
          upload: false,
          update: false,
          admin: false
        },
        isRecovery: true,
        canDelete: false,
        canEdit: false
      },
      {
        id: 'user_001',
        name: 'John Smith',
        role: 'Senior Member',
        email: 'john.smith@agr.gc.ca',
        department: 'Research Division',
        permissions: {
          create: true,
          upload: true,
          update: true,
          admin: true
        },
        isRecovery: false,
        canDelete: true,
        canEdit: true
      },
      {
        id: 'user_002',
        name: 'Sarah Johnson',
        role: 'Regular Member',
        email: 'sarah.johnson@agr.gc.ca',
        department: 'Data Analysis',
        permissions: {
          create: true,
          upload: true,
          update: false,
          admin: false
        },
        isRecovery: false,
        canDelete: true,
        canEdit: true
      },
      {
        id: 'user_003',
        name: 'Michael Brown',
        role: 'Junior Member',
        email: 'michael.brown@agr.gc.ca',
        department: 'Field Operations',
        permissions: {
          create: false,
          upload: true,
          update: false,
          admin: false
        },
        isRecovery: false,
        canDelete: true,
        canEdit: true
      },
      {
        id: 'user_004',
        name: 'Emily Davis',
        role: 'Administrator',
        email: 'emily.davis@agr.gc.ca',
        department: 'IT Support',
        permissions: {
          create: true,
          upload: true,
          update: true,
          admin: true
        },
        isRecovery: false,
        canDelete: true,
        canEdit: true
      },
      {
        id: 'user_005',
        name: 'Robert Wilson',
        role: 'Regular Member',
        email: 'robert.wilson@agr.gc.ca',
        department: 'Quality Control',
        permissions: {
          create: true,
          upload: false,
          update: true,
          admin: false
        },
        isRecovery: false,
        canDelete: true,
        canEdit: true
      }
    ];

    // Load from localStorage if available
    const savedUsers = localStorage.getItem('userManagementData');
    if (savedUsers) {
      const loadedUsers = JSON.parse(savedUsers);
      // Ensure recovery account is always first and properly configured
      const recoveryAccount = loadedUsers.find(u => u.isRecovery);
      const otherUsers = loadedUsers.filter(u => !u.isRecovery);
      
      if (recoveryAccount) {
        // Ensure recovery account has correct settings
        recoveryAccount.permissions = {
          create: false,
          upload: false,
          update: false,
          admin: false
        };
        recoveryAccount.canDelete = false;
        recoveryAccount.canEdit = false;
        this.users = [recoveryAccount, ...otherUsers];
      } else {
        this.users = loadedUsers;
      }
    }

    this.filteredUsers = [...this.users];
  }

  bindEvents() {
    // Search functionality
    document.getElementById('nameSearch').addEventListener('input', (e) => {
      this.handleSearch();
    });

    document.getElementById('roleSearch').addEventListener('input', (e) => {
      this.handleSearch();
    });

    // Action buttons
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.cancelChanges();
    });

    document.getElementById('updateBtn').addEventListener('click', () => {
      this.updateUsers();
    });

    document.getElementById('addUserBtn').addEventListener('click', () => {
      this.openAddUserModal();
    });

    // Modal events
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        this.closeModal(e.target.closest('.modal'));
      });
    });

    // Add user modal
    document.getElementById('saveNewUser').addEventListener('click', () => {
      this.saveNewUser();
    });

    document.getElementById('cancelNewUser').addEventListener('click', () => {
      this.closeModal(document.getElementById('addUserModal'));
    });

    // Delete confirmation modal
    document.getElementById('confirmDelete').addEventListener('click', () => {
      this.confirmDeleteUser();
    });

    document.getElementById('cancelDelete').addEventListener('click', () => {
      this.closeModal(document.getElementById('deleteModal'));
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });
  }

  updateCurrentUserDisplay() {
    document.getElementById('currentUserName').textContent = this.currentUser.name;
    document.getElementById('currentUserRole').textContent = `(${this.currentUser.role})`;
    document.getElementById('currentUserIcon').textContent = this.currentUser.name.charAt(0);
    
    const notice = this.currentUser.role === 'Senior Member' || this.currentUser.role === 'Administrator' 
      ? 'You have full administrative privileges'
      : 'You have limited administrative privileges';
    document.getElementById('permissionNotice').textContent = notice;
  }

  handleSearch() {
    const nameQuery = document.getElementById('nameSearch').value.toLowerCase();
    const roleQuery = document.getElementById('roleSearch').value.toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const nameMatch = !nameQuery || user.name.toLowerCase().includes(nameQuery);
      const roleMatch = !roleQuery || user.role.toLowerCase().includes(roleQuery);
      return nameMatch && roleMatch;
    });

    this.renderUsers();
  }

  renderUsers() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    if (this.filteredUsers.length === 0) {
      const row = tbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 7;
      cell.textContent = 'No users found';
      cell.style.textAlign = 'center';
      cell.style.padding = '40px';
      cell.style.color = '#666';
      return;
    }

    this.filteredUsers.forEach(user => {
      const row = tbody.insertRow();
      row.className = `user-row ${user.isRecovery ? 'recovery-account' : ''}`;
      row.dataset.userId = user.id;

      // Employee Name
      const nameCell = row.insertCell();
      nameCell.className = 'name-column';
      nameCell.innerHTML = `
        <span class="user-name">${user.name}</span>
        ${user.isRecovery ? '<span class="recovery-badge">RECOVERY</span>' : ''}
      `;

      // Employee Role
      const roleCell = row.insertCell();
      roleCell.className = 'role-column user-role-cell';
      roleCell.textContent = user.role;

      // Create Permission
      const createCell = row.insertCell();
      createCell.innerHTML = `
        <input type="checkbox" 
               class="permission-checkbox" 
               data-user-id="${user.id}" 
               data-permission="create"
               ${user.permissions.create ? 'checked' : ''}
               ${!this.canEditUser(user) ? 'disabled' : ''}>
      `;

      // Upload Permission
      const uploadCell = row.insertCell();
      uploadCell.innerHTML = `
        <input type="checkbox" 
               class="permission-checkbox" 
               data-user-id="${user.id}" 
               data-permission="upload"
               ${user.permissions.upload ? 'checked' : ''}
               ${!this.canEditUser(user) ? 'disabled' : ''}>
      `;

      // Update Permission
      const updateCell = row.insertCell();
      updateCell.innerHTML = `
        <input type="checkbox" 
               class="permission-checkbox" 
               data-user-id="${user.id}" 
               data-permission="update"
               ${user.permissions.update ? 'checked' : ''}
               ${!this.canEditUser(user) ? 'disabled' : ''}>
      `;

      // Admin Permission
      const adminCell = row.insertCell();
      adminCell.innerHTML = `
        <input type="checkbox" 
               class="permission-checkbox" 
               data-user-id="${user.id}" 
               data-permission="admin"
               ${user.permissions.admin ? 'checked' : ''}
               ${!this.canEditUser(user) ? 'disabled' : ''}>
      `;

      // Delete Button
      const deleteCell = row.insertCell();
      deleteCell.className = 'delete-column';
      deleteCell.innerHTML = `
        <button class="delete-user-btn" 
                data-user-id="${user.id}"
                ${!this.canDeleteUser(user) ? 'disabled' : ''}>
          DELETE
        </button>
      `;
    });

    // Bind permission change events
    document.querySelectorAll('.permission-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.handlePermissionChange(e);
      });
    });

    // Bind delete button events
    document.querySelectorAll('.delete-user-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        if (!e.target.disabled) {
          this.openDeleteModal(e.target.dataset.userId);
        }
      });
    });
  }

  canEditUser(user) {
    // Recovery account cannot be edited by anyone
    if (user.isRecovery) return false;
    
    // Only Senior Members and Administrators can edit users
    return this.currentUser.role === 'Senior Member' || this.currentUser.role === 'Administrator';
  }

  canDeleteUser(user) {
    // Recovery account cannot be deleted
    if (user.isRecovery) return false;
    
    // Users cannot delete themselves
    if (user.id === this.currentUser.id) return false;
    
    // Only Senior Members and Administrators can delete users
    return this.currentUser.role === 'Senior Member' || this.currentUser.role === 'Administrator';
  }

  handlePermissionChange(event) {
    const userId = event.target.dataset.userId;
    const permission = event.target.dataset.permission;
    const isChecked = event.target.checked;

    // Store pending change
    if (!this.pendingChanges.has(userId)) {
      this.pendingChanges.set(userId, {});
    }
    
    this.pendingChanges.get(userId)[permission] = isChecked;
    
    // Visual feedback for pending changes
    event.target.closest('.user-row').style.backgroundColor = '#fff3cd';
    
    this.showNotification('Permission change pending. Click UPDATE to save changes.', 'warning');
  }

  openDeleteModal(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    this.userToDelete = user;
    
    document.getElementById('deleteUserName').textContent = user.name;
    document.getElementById('deleteUserRole').textContent = user.role;
    
    document.getElementById('deleteModal').style.display = 'block';
  }

  confirmDeleteUser() {
    if (!this.userToDelete) return;

    // Remove user from arrays
    this.users = this.users.filter(u => u.id !== this.userToDelete.id);
    this.filteredUsers = this.filteredUsers.filter(u => u.id !== this.userToDelete.id);
    
    // Remove any pending changes for this user
    this.pendingChanges.delete(this.userToDelete.id);
    
    // Save to storage
    this.saveToStorage();
    
    // Re-render
    this.renderUsers();
    
    // Close modal
    this.closeModal(document.getElementById('deleteModal'));
    
    this.showNotification(`User "${this.userToDelete.name}" has been deleted successfully.`, 'success');
    this.userToDelete = null;
  }

  openAddUserModal() {
    document.getElementById('addUserForm').reset();
    document.getElementById('addUserModal').style.display = 'block';
  }

  saveNewUser() {
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const email = document.getElementById('newUserEmail').value.trim();
    const department = document.getElementById('newUserDepartment').value.trim();

    if (!name || !role || !email) {
      this.showNotification('Please fill in all required fields.', 'error');
      return;
    }

    // Check if email already exists
    if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.showNotification('A user with this email already exists.', 'error');
      return;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name,
      role,
      email,
      department,
      permissions: {
        create: document.getElementById('newUserCreate').checked,
        upload: document.getElementById('newUserUpload').checked,
        update: document.getElementById('newUserUpdate').checked,
        admin: document.getElementById('newUserAdmin').checked
      },
      isRecovery: false,
      canDelete: true,
      canEdit: true
    };

    this.users.push(newUser);
    this.filteredUsers = [...this.users];
    this.saveToStorage();
    this.renderUsers();
    
    this.closeModal(document.getElementById('addUserModal'));
    this.showNotification(`User "${name}" has been added successfully.`, 'success');
  }

  updateUsers() {
    if (this.pendingChanges.size === 0) {
      this.showNotification('No changes to update.', 'warning');
      return;
    }

    let updatedCount = 0;

    // Apply all pending changes
    this.pendingChanges.forEach((changes, userId) => {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        Object.keys(changes).forEach(permission => {
          user.permissions[permission] = changes[permission];
        });
        updatedCount++;
      }
    });

    // Clear pending changes
    this.pendingChanges.clear();
    
    // Save to storage
    this.saveToStorage();
    
    // Re-render to remove visual indicators
    this.renderUsers();
    
    this.showNotification(`Successfully updated permissions for ${updatedCount} user(s).`, 'success');
  }

  cancelChanges() {
    if (this.pendingChanges.size === 0) {
      this.showNotification('No changes to cancel.', 'warning');
      return;
    }

    // Clear pending changes
    this.pendingChanges.clear();
    
    // Re-render to restore original state
    this.renderUsers();
    
    this.showNotification('All pending changes have been cancelled.', 'success');
  }

  closeModal(modal) {
    modal.style.display = 'none';
  }

  saveToStorage() {
    localStorage.setItem('userManagementData', JSON.stringify(this.users));
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.getElementById('notificationContainer').appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new UserManagementSystem();
  
  // Add fade-in animation
  document.body.classList.add('fade-in');
});