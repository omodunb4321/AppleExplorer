class SearchListManager {
  constructor() {
    this.data = [];
    this.filteredData = [];
    this.currentView = 'list';
    this.sortColumn = 'species';
    this.sortDirection = 'asc';
    this.currentEditingId = null;
    this.currentImageUploadId = null;
    
    this.init();
  }

  init() {
    this.loadSampleData();
    this.bindEvents();
    this.renderData();
    this.populateFilterOptions();
  }

  loadSampleData() {
    // Enhanced sample data with more apple species
    this.data = [
      {
        id: 1,
        species: 'Malus domestica',
        cultivar: 'Honeycrisp',
        country: 'United States',
        state: 'Minnesota',
        city: 'Minneapolis',
        image: null,
        notes: 'Popular apple variety known for its crisp texture and sweet-tart flavor. Developed at the University of Minnesota.'
      },
      {
        id: 2,
        species: 'Malus domestica',
        cultivar: 'Gala',
        country: 'New Zealand',
        state: 'Canterbury',
        city: 'Christchurch',
        image: null,
        notes: 'Sweet apple variety with red and yellow skin. One of the most popular commercial varieties worldwide.'
      },
      {
        id: 3,
        species: 'Malus domestica',
        cultivar: 'Granny Smith',
        country: 'Australia',
        state: 'New South Wales',
        city: 'Sydney',
        image: null,
        notes: 'Tart green apple, excellent for baking. Named after Maria Ann Smith who first grew the variety in 1868.'
      },
      {
        id: 4,
        species: 'Malus domestica',
        cultivar: 'Red Delicious',
        country: 'United States',
        state: 'Iowa',
        city: 'Peru',
        image: null,
        notes: 'Classic American apple variety with deep red skin and sweet flavor. Once the most popular apple in the US.'
      },
      {
        id: 5,
        species: 'Malus domestica',
        cultivar: 'Fuji',
        country: 'Japan',
        state: 'Aomori',
        city: 'Fujisaki',
        image: null,
        notes: 'Sweet, crisp apple developed in Japan. Cross between Red Delicious and Ralls Janet varieties.'
      },
      {
        id: 6,
        species: 'Malus domestica',
        cultivar: 'Golden Delicious',
        country: 'United States',
        state: 'West Virginia',
        city: 'Clay County',
        image: null,
        notes: 'Yellow-skinned apple with sweet flavor. Not related to Red Delicious despite the name.'
      },
      {
        id: 7,
        species: 'Malus domestica',
        cultivar: 'Braeburn',
        country: 'New Zealand',
        state: 'Nelson',
        city: 'Motueka',
        image: null,
        notes: 'Crisp apple with sweet-tart flavor and red-orange skin. Excellent for both eating fresh and cooking.'
      },
      {
        id: 8,
        species: 'Malus domestica',
        cultivar: 'Pink Lady',
        country: 'Australia',
        state: 'Western Australia',
        city: 'Perth',
        image: null,
        notes: 'Late-season apple with pink blush and tart flavor. Requires specific climate conditions to develop properly.'
      },
      {
        id: 9,
        species: 'Pyrus communis',
        cultivar: 'Bartlett',
        country: 'England',
        state: 'Berkshire',
        city: 'Reading',
        image: null,
        notes: 'Classic pear variety, also known as Williams. Bell-shaped with sweet, juicy flesh.'
      },
      {
        id: 10,
        species: 'Pyrus communis',
        cultivar: 'Anjou',
        country: 'France',
        state: 'Pays de la Loire',
        city: 'Angers',
        image: null,
        notes: 'Sweet, juicy pear with smooth texture. Available in both green and red varieties.'
      }
    ];

    // Load from localStorage if available
    const savedData = localStorage.getItem('searchListData');
    if (savedData) {
      this.data = JSON.parse(savedData);
    }

    this.filteredData = [...this.data];
    this.sortData();
  }

  bindEvents() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // View toggle
    document.getElementById('listViewBtn').addEventListener('click', () => {
      this.switchView('list');
    });

    document.getElementById('pictureViewBtn').addEventListener('click', () => {
      this.switchView('picture');
    });

    // Picture view sorting controls
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.sortColumn = e.target.value;
      this.sortData();
      this.renderData();
    });

    document.getElementById('sortOrderBtn').addEventListener('click', () => {
      this.toggleSortOrder();
    });

    // Export buttons
    document.getElementById('exportPdfBtn').addEventListener('click', () => {
      this.exportToPDF();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      this.exportToCSV();
    });

    // Filter panel toggle
    document.getElementById('filterBtn').addEventListener('click', () => {
      this.toggleFilterPanel();
    });

    // Filter actions
    document.getElementById('applyFilters').addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
      this.clearFilters();
    });

    // Import/Export
    document.getElementById('importBtn').addEventListener('click', () => {
      this.handleImport();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.handleExport();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.processImportFile(e.target.files[0]);
    });

    // Add entry
    document.getElementById('addEntryBtn').addEventListener('click', () => {
      this.openEntryModal();
    });

    // Modal events
    document.querySelectorAll('.close').forEach(closeBtn => {
      closeBtn.addEventListener('click', (e) => {
        this.closeModal(e.target.closest('.modal'));
      });
    });

    document.getElementById('saveEntry').addEventListener('click', () => {
      this.saveEntry();
    });

    document.getElementById('cancelEntry').addEventListener('click', () => {
      this.closeModal(document.getElementById('entryModal'));
    });

    document.getElementById('saveImage').addEventListener('click', () => {
      this.saveImage();
    });

    document.getElementById('cancelImage').addEventListener('click', () => {
      this.closeModal(document.getElementById('imageModal'));
    });

    // Image preview
    document.getElementById('entryImage').addEventListener('change', (e) => {
      this.previewImage(e.target.files[0], 'imagePreview');
    });

    document.getElementById('imageUpload').addEventListener('change', (e) => {
      this.previewImage(e.target.files[0], 'uploadPreview');
    });

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => {
        this.handleSort(header.dataset.column);
      });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.filteredData = [...this.data];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredData = this.data.filter(item => 
        item.species.toLowerCase().includes(searchTerm) ||
        item.cultivar.toLowerCase().includes(searchTerm) ||
        item.country.toLowerCase().includes(searchTerm) ||
        (item.state && item.state.toLowerCase().includes(searchTerm)) ||
        (item.city && item.city.toLowerCase().includes(searchTerm)) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm))
      );
    }
    this.sortData();
    this.renderData();
  }

  switchView(view) {
    this.currentView = view;
    
    // Update button states
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    document.getElementById('pictureViewBtn').classList.toggle('active', view === 'picture');
    
    // Show/hide views
    document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('pictureView').style.display = view === 'picture' ? 'block' : 'none';
    
    // Show/hide picture export controls
    document.getElementById('pictureExportControls').style.display = view === 'picture' ? 'block' : 'none';
    
    this.renderData();
  }

  sortData() {
    this.filteredData.sort((a, b) => {
      let aVal = a[this.sortColumn] || '';
      let bVal = b[this.sortColumn] || '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }

  toggleSortOrder() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    const btn = document.getElementById('sortOrderBtn');
    btn.textContent = this.sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending';
    btn.dataset.order = this.sortDirection;
    
    this.sortData();
    this.renderData();
  }

  toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  applyFilters() {
    const species = document.getElementById('speciesFilter').value;
    const cultivar = document.getElementById('cultivarFilter').value;
    const country = document.getElementById('countryFilter').value;
    const state = document.getElementById('stateFilter').value;
    const city = document.getElementById('cityFilter').value;

    this.filteredData = this.data.filter(item => {
      return (!species || item.species === species) &&
             (!cultivar || item.cultivar === cultivar) &&
             (!country || item.country === country) &&
             (!state || item.state === state) &&
             (!city || item.city === city);
    });

    this.sortData();
    this.renderData();
    this.showNotification('Filters applied successfully', 'success');
  }

  clearFilters() {
    document.getElementById('speciesFilter').value = '';
    document.getElementById('cultivarFilter').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('stateFilter').value = '';
    document.getElementById('cityFilter').value = '';
    
    this.filteredData = [...this.data];
    this.sortData();
    this.renderData();
    this.showNotification('Filters cleared', 'success');
  }

  populateFilterOptions() {
    const species = [...new Set(this.data.map(item => item.species))];
    const cultivars = [...new Set(this.data.map(item => item.cultivar))];
    const countries = [...new Set(this.data.map(item => item.country))];
    const states = [...new Set(this.data.map(item => item.state).filter(Boolean))];
    const cities = [...new Set(this.data.map(item => item.city).filter(Boolean))];

    this.populateSelect('speciesFilter', species);
    this.populateSelect('cultivarFilter', cultivars);
    this.populateSelect('countryFilter', countries);
    this.populateSelect('stateFilter', states);
    this.populateSelect('cityFilter', cities);
  }

  populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }
    
    options.forEach(option => {
      if (option) {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      }
    });
    
    select.value = currentValue;
  }

  handleSort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortData();
    this.renderData();
    this.updateSortIndicators();
  }

  updateSortIndicators() {
    document.querySelectorAll('.sort-arrow').forEach(arrow => {
      arrow.textContent = '↕';
    });

    if (this.sortColumn) {
      const header = document.querySelector(`[data-column="${this.sortColumn}"] .sort-arrow`);
      if (header) {
        header.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
      }
    }
  }

  renderData() {
    if (this.currentView === 'list') {
      this.renderTableView();
    } else {
      this.renderPictureView();
    }
  }

  renderTableView() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (this.filteredData.length === 0) {
      const row = tbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 7;
      cell.textContent = 'No data found';
      cell.style.textAlign = 'center';
      cell.style.padding = '40px';
      cell.style.color = '#666';
      return;
    }

    this.filteredData.forEach(item => {
      const row = tbody.insertRow();
      
      // Species
      const speciesCell = row.insertCell();
      speciesCell.textContent = item.species;
      
      // Cultivar
      const cultivarCell = row.insertCell();
      cultivarCell.textContent = item.cultivar;
      
      // Country
      const countryCell = row.insertCell();
      countryCell.textContent = item.country;
      
      // State
      const stateCell = row.insertCell();
      stateCell.textContent = item.state || '-';
      
      // City
      const cityCell = row.insertCell();
      cityCell.textContent = item.city || '-';
      
      // Image
      const imageCell = row.insertCell();
      imageCell.className = 'image-cell';
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.className = 'table-image';
        img.onclick = () => this.openImageModal(item.id);
        imageCell.appendChild(img);
      } else {
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = 'Upload';
        uploadBtn.className = 'upload-image-btn';
        uploadBtn.onclick = () => this.openImageModal(item.id);
        imageCell.appendChild(uploadBtn);
      }
      
      // More Info
      const moreInfoCell = row.insertCell();
      moreInfoCell.className = 'image-cell';
      const moreInfoBtn = document.createElement('button');
      moreInfoBtn.textContent = '•••';
      moreInfoBtn.className = 'more-info-btn';
      moreInfoBtn.onclick = () => this.openEntryModal(item);
      moreInfoCell.appendChild(moreInfoBtn);
    });
  }

  renderPictureView() {
    const grid = document.getElementById('pictureGrid');
    const titleElement = document.getElementById('pictureViewTitle');
    const countElement = document.getElementById('totalCount');
    
    // Update title and count
    const appleCount = this.filteredData.filter(item => item.species.includes('Malus')).length;
    const pearCount = this.filteredData.filter(item => item.species.includes('Pyrus')).length;
    
    titleElement.textContent = `Agricultural Species Information (${appleCount} Apple${appleCount !== 1 ? 's' : ''}, ${pearCount} Pear${pearCount !== 1 ? 's' : ''})`;
    countElement.textContent = `${this.filteredData.length} total entries`;
    
    grid.innerHTML = '';

    if (this.filteredData.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No data found</div>';
      return;
    }

    this.filteredData.forEach(item => {
      const card = document.createElement('div');
      card.className = 'picture-card';
      
      const imageContainer = document.createElement('div');
      imageContainer.className = 'picture-card-image';
      
      if (item.image) {
        const img = document.createElement('img');
        img.src = item.image;
        img.onclick = () => this.openImageModal(item.id);
        imageContainer.appendChild(img);
      } else {
        imageContainer.textContent = 'No Image Available';
        imageContainer.style.cursor = 'pointer';
        imageContainer.onclick = () => this.openImageModal(item.id);
      }
      
      const content = document.createElement('div');
      content.className = 'picture-card-content';
      
      content.innerHTML = `
        <h4>${item.cultivar}</h4>
        <div class="info-row">
          <span class="info-label">Species:</span>
          <span class="info-value">${item.species}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Origin:</span>
          <span class="info-value">${item.country}</span>
        </div>
        <div class="info-row">
          <span class="info-label">State:</span>
          <span class="info-value">${item.state || 'Not specified'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">City:</span>
          <span class="info-value">${item.city || 'Not specified'}</span>
        </div>
        ${item.notes ? `
          <div class="notes-section">
            <div class="notes-label">Notes:</div>
            <div class="notes-text">${item.notes}</div>
          </div>
        ` : ''}
      `;
      
      content.onclick = () => this.openEntryModal(item);
      content.style.cursor = 'pointer';
      
      card.appendChild(imageContainer);
      card.appendChild(content);
      grid.appendChild(card);
    });
  }

  exportToPDF() {
    if (typeof window.jsPDF === 'undefined') {
      this.showNotification('PDF library not loaded. Please refresh the page.', 'error');
      return;
    }

    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Agricultural Species Information Report', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total entries: ${this.filteredData.length}`, 20, 40);
    
    let yPosition = 60;
    
    this.filteredData.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Entry header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${item.cultivar}`, 20, yPosition);
      
      // Entry details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPosition += 10;
      doc.text(`Species: ${item.species}`, 25, yPosition);
      yPosition += 7;
      doc.text(`Origin: ${item.country}`, 25, yPosition);
      yPosition += 7;
      doc.text(`State/Province: ${item.state || 'Not specified'}`, 25, yPosition);
      yPosition += 7;
      doc.text(`City: ${item.city || 'Not specified'}`, 25, yPosition);
      
      if (item.notes) {
        yPosition += 7;
        const splitNotes = doc.splitTextToSize(`Notes: ${item.notes}`, 160);
        doc.text(splitNotes, 25, yPosition);
        yPosition += splitNotes.length * 5;
      }
      
      yPosition += 15; // Space between entries
    });
    
    // Save the PDF
    doc.save(`agricultural_species_report_${new Date().toISOString().split('T')[0]}.pdf`);
    this.showNotification('PDF exported successfully', 'success');
  }

  exportToCSV() {
    const headers = ['Species', 'Cultivar Name', 'Origin Country', 'State/Province', 'City', 'Notes', 'Has Image'];
    const csvContent = [
      headers.join(','),
      ...this.filteredData.map(item => [
        `"${item.species}"`,
        `"${item.cultivar}"`,
        `"${item.country}"`,
        `"${item.state || ''}"`,
        `"${item.city || ''}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
        item.image ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agricultural_species_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    this.showNotification('CSV exported successfully', 'success');
  }

  openEntryModal(item = null) {
    this.currentEditingId = item ? item.id : null;
    const modal = document.getElementById('entryModal');
    const title = document.getElementById('modalTitle');
    
    if (item) {
      title.textContent = 'Edit Entry';
      document.getElementById('entrySpecies').value = item.species;
      document.getElementById('entryCultivar').value = item.cultivar;
      document.getElementById('entryCountry').value = item.country;
      document.getElementById('entryState').value = item.state || '';
      document.getElementById('entryCity').value = item.city || '';
      document.getElementById('entryNotes').value = item.notes || '';
      
      const preview = document.getElementById('imagePreview');
      if (item.image) {
        preview.src = item.image;
        preview.style.display = 'block';
      } else {
        preview.style.display = 'none';
      }
    } else {
      title.textContent = 'Add New Entry';
      document.getElementById('entryForm').reset();
      document.getElementById('imagePreview').style.display = 'none';
    }
    
    modal.style.display = 'block';
  }

  openImageModal(itemId) {
    this.currentImageUploadId = itemId;
    const modal = document.getElementById('imageModal');
    const preview = document.getElementById('uploadPreview');
    
    const item = this.data.find(d => d.id === itemId);
    if (item && item.image) {
      preview.src = item.image;
      preview.style.display = 'block';
      document.querySelector('.upload-placeholder').style.display = 'none';
    } else {
      preview.style.display = 'none';
      document.querySelector('.upload-placeholder').style.display = 'block';
    }
    
    modal.style.display = 'block';
  }

  saveEntry() {
    const species = document.getElementById('entrySpecies').value.trim();
    const cultivar = document.getElementById('entryCultivar').value.trim();
    const country = document.getElementById('entryCountry').value.trim();
    const state = document.getElementById('entryState').value.trim();
    const city = document.getElementById('entryCity').value.trim();
    const notes = document.getElementById('entryNotes').value.trim();
    const imageFile = document.getElementById('entryImage').files[0];

    if (!species || !cultivar || !country) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    const entryData = {
      species,
      cultivar,
      country,
      state,
      city,
      notes
    };

    if (this.currentEditingId) {
      // Update existing entry
      const index = this.data.findIndex(item => item.id === this.currentEditingId);
      if (index !== -1) {
        this.data[index] = { ...this.data[index], ...entryData };
        
        if (imageFile) {
          this.processImageFile(imageFile, (imageData) => {
            this.data[index].image = imageData;
            this.saveAndRefresh();
          });
        } else {
          this.saveAndRefresh();
        }
      }
    } else {
      // Add new entry
      const newId = Math.max(...this.data.map(item => item.id), 0) + 1;
      const newEntry = { id: newId, image: null, ...entryData };
      
      if (imageFile) {
        this.processImageFile(imageFile, (imageData) => {
          newEntry.image = imageData;
          this.data.push(newEntry);
          this.saveAndRefresh();
        });
      } else {
        this.data.push(newEntry);
        this.saveAndRefresh();
      }
    }
  }

  saveImage() {
    const imageFile = document.getElementById('imageUpload').files[0];
    
    if (!imageFile) {
      this.showNotification('Please select an image', 'error');
      return;
    }

    if (!this.currentImageUploadId) {
      this.showNotification('No item selected for image upload', 'error');
      return;
    }

    this.processImageFile(imageFile, (imageData) => {
      const index = this.data.findIndex(item => item.id === this.currentImageUploadId);
      if (index !== -1) {
        this.data[index].image = imageData;
        this.saveAndRefresh();
        this.closeModal(document.getElementById('imageModal'));
        this.showNotification('Image uploaded successfully', 'success');
      }
    });
  }

  processImageFile(file, callback) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  previewImage(file, previewId) {
    if (file) {
      this.processImageFile(file, (imageData) => {
        const preview = document.getElementById(previewId);
        preview.src = imageData;
        preview.style.display = 'block';
        
        if (previewId === 'uploadPreview') {
          document.querySelector('.upload-placeholder').style.display = 'none';
        }
      });
    }
  }

  saveAndRefresh() {
    this.saveToStorage();
    this.filteredData = [...this.data];
    this.sortData();
    this.renderData();
    this.populateFilterOptions();
    this.closeModal(document.getElementById('entryModal'));
    this.showNotification('Entry saved successfully', 'success');
  }

  closeModal(modal) {
    modal.style.display = 'none';
    this.currentEditingId = null;
    this.currentImageUploadId = null;
  }

  handleImport() {
    document.getElementById('importFile').click();
  }

  processImportFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let importData;
        
        if (file.name.endsWith('.json')) {
          importData = JSON.parse(e.target.result);
        } else if (file.name.endsWith('.csv')) {
          importData = this.parseCSV(e.target.result);
        } else {
          this.showNotification('Unsupported file format. Please use JSON or CSV.', 'error');
          return;
        }

        if (Array.isArray(importData) && importData.length > 0) {
          // Assign new IDs to imported data
          const maxId = Math.max(...this.data.map(item => item.id), 0);
          importData.forEach((item, index) => {
            item.id = maxId + index + 1;
            if (!item.image) item.image = null;
          });

          this.data = [...this.data, ...importData];
          this.saveAndRefresh();
          this.showNotification(`Successfully imported ${importData.length} entries`, 'success');
        } else {
          this.showNotification('Invalid data format in import file', 'error');
        }
      } catch (error) {
        this.showNotification('Error parsing import file', 'error');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const entry = {};
        
        headers.forEach((header, index) => {
          const value = values[index] ? values[index].trim() : '';
          
          switch (header) {
            case 'species':
              entry.species = value;
              break;
            case 'cultivar':
            case 'cultivar name':
              entry.cultivar = value;
              break;
            case 'country':
            case 'origin of country':
              entry.country = value;
              break;
            case 'state':
            case 'state/province':
              entry.state = value;
              break;
            case 'city':
              entry.city = value;
              break;
            case 'notes':
              entry.notes = value;
              break;
          }
        });

        if (entry.species && entry.cultivar && entry.country) {
          data.push(entry);
        }
      }
    }

    return data;
  }

  handleExport() {
    const exportData = this.data.map(item => ({
      species: item.species,
      cultivar: item.cultivar,
      country: item.country,
      state: item.state || '',
      city: item.city || '',
      notes: item.notes || '',
      hasImage: !!item.image
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `agricultural_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('Data exported successfully', 'success');
  }

  saveToStorage() {
    localStorage.setItem('searchListData', JSON.stringify(this.data));
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new SearchListManager();
  
  // Add fade-in animation
  document.body.classList.add('fade-in');
});