/* ============================================
   SMART PHARMACY MANAGEMENT SYSTEM
   Global JavaScript - CRUD & Interactivity
   ============================================ */

// ============================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================

/**
 * Check if user is logged in
 * Redirects to login page if not authenticated
 */
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        // Only redirect if not already on login or register page
        const currentPage = window.location.pathname.split('/').pop() || '';
        
        if (currentPage !== '/login' && currentPage !== '/register' && currentPage !== '') {
            window.location.href = '/login';
        }
    }
}

/**
 * Logout user and clear session
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userPhone');
}

// ============================================
// NAVIGATION & UI MANAGEMENT
// ============================================

/**
 * Set active navigation link based on current page
 * @param {string} currentPage - Current page filename
 */
function setActiveNavigation(currentPage) {
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Close modal when clicking outside of it
 */
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

/**
 * Close modal when pressing Escape key
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }
});

// ============================================
// LOCAL STORAGE INITIALIZATION
// ============================================

/**
 * Initialize sample data if localStorage is empty
 */
function initializeSampleData() {
    // Check if data already exists
    if (!localStorage.getItem('medicines')) {
        const sampleMedicines = [
            {
                name: 'Aspirin',
                code: 'ASP-001',
                category: 'Analgesic',
                quantity: 150,
                minStock: 50,
                price: 5.99,
                expiry: '2025-12-31'
            },
            {
                name: 'Ibuprofen',
                code: 'IBU-001',
                category: 'Anti-inflammatory',
                quantity: 30,
                minStock: 50,
                price: 7.99,
                expiry: '2025-11-30'
            },
            {
                name: 'Amoxicillin',
                code: 'AMX-001',
                category: 'Antibiotic',
                quantity: 200,
                minStock: 100,
                price: 12.50,
                expiry: '2026-06-30'
            }
        ];
        
        localStorage.setItem('medicines', JSON.stringify(sampleMedicines));
    }

    if (!localStorage.getItem('suppliers')) {
        const sampleSuppliers = [
            {
                name: 'MediPharm Inc.',
                contactPerson: 'John Smith',
                phone: '+1 (555) 123-4567',
                email: 'john@medipharm.com',
                city: 'New York',
                address: '123 Medical Ave, NY 10001'
            },
            {
                name: 'PharmaCare Solutions',
                contactPerson: 'Sarah Johnson',
                phone: '+1 (555) 234-5678',
                email: 'sarah@pharmacare.com',
                city: 'Los Angeles',
                address: '456 Pharma St, LA 90001'
            }
        ];
        
        localStorage.setItem('suppliers', JSON.stringify(sampleSuppliers));
    }

    if (!localStorage.getItem('sales')) {
        const sampleSales = [
            {
                medicineName: 'Aspirin',
                medicineCode: 'ASP-001',
                quantity: 10,
                unitPrice: 5.99,
                amount: 59.90,
                date: new Date().toISOString().split('T')[0],
                customer: 'Patient A'
            }
        ];
        
        localStorage.setItem('sales', JSON.stringify(sampleSales));
    }
}

// Initialize sample data on first load
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency values
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2);
}

/**
 * Format date to readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Show notification/alert message
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning'
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '2000';
    notification.style.maxWidth = '400px';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid phone
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// ============================================
// DATA EXPORT & IMPORT
// ============================================

/**
 * Export data to JSON file
 * @param {string} dataType - Type of data to export: 'medicines', 'suppliers', 'sales'
 */
function exportData(dataType) {
    const data = localStorage.getItem(dataType);
    
    if (!data) {
        alert('No data to export');
        return;
    }
    
    const jsonString = JSON.stringify(JSON.parse(data), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// SEARCH & FILTER UTILITIES
// ============================================

/**
 * Perform case-insensitive search on array of objects
 * @param {Array} array - Array to search
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered array
 */
function searchArray(array, searchTerm, fields) {
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

/**
 * Sort array of objects by field
 * @param {Array} array - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order: 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortArray(array, field, order = 'asc') {
    return [...array].sort((a, b) => {
        const valueA = a[field];
        const valueB = b[field];
        
        if (typeof valueA === 'string') {
            return order === 'asc' 
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }
        
        return order === 'asc' 
            ? valueA - valueB
            : valueB - valueA;
    });
}

// ============================================
// STATISTICS & CALCULATIONS
// ============================================

/**
 * Calculate statistics for medicines
 * @returns {Object} Statistics object
 */
function getMedicineStatistics() {
    const medicines = JSON.parse(localStorage.getItem('medicines')) || [];
    
    return {
        total: medicines.length,
        lowStock: medicines.filter(m => m.quantity < m.minStock).length,
        totalValue: medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0),
        expiringSoon: medicines.filter(m => {
            const expiryDate = new Date(m.expiry);
            const today = new Date();
            const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length
    };
}

/**
 * Calculate statistics for sales
 * @returns {Object} Statistics object
 */
function getSalesStatistics() {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    
    return {
        total: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + parseFloat(s.amount), 0),
        averageTransaction: sales.length > 0 
            ? sales.reduce((sum, s) => sum + parseFloat(s.amount), 0) / sales.length 
            : 0,
        totalQuantitySold: sales.reduce((sum, s) => sum + s.quantity, 0)
    };
}

/**
 * Get sales by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array} Filtered sales
 */
function getSalesByDateRange(startDate, endDate) {
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate <= end;
    });
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate medicine data
 * @param {Object} medicine - Medicine object
 * @returns {Object} Validation result
 */
function validateMedicine(medicine) {
    const errors = [];
    
    if (!medicine.name || medicine.name.trim() === '') {
        errors.push('Medicine name is required');
    }
    
    if (!medicine.code || medicine.code.trim() === '') {
        errors.push('Medicine code is required');
    }
    
    if (medicine.quantity < 0) {
        errors.push('Quantity cannot be negative');
    }
    
    if (medicine.price < 0) {
        errors.push('Price cannot be negative');
    }
    
    if (new Date(medicine.expiry) < new Date()) {
        errors.push('Expiry date cannot be in the past');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate supplier data
 * @param {Object} supplier - Supplier object
 * @returns {Object} Validation result
 */
function validateSupplier(supplier) {
    const errors = [];
    
    if (!supplier.name || supplier.name.trim() === '') {
        errors.push('Supplier name is required');
    }
    
    if (!supplier.email || !isValidEmail(supplier.email)) {
        errors.push('Valid email address is required');
    }
    
    if (!supplier.phone || !isValidPhone(supplier.phone)) {
        errors.push('Valid phone number is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Delete multiple items
 * @param {string} dataType - Type of data: 'medicines', 'suppliers', 'sales'
 * @param {Array} indices - Array of indices to delete
 */
function deleteMultiple(dataType, indices) {
    let data = JSON.parse(localStorage.getItem(dataType)) || [];
    
    // Sort indices in descending order to avoid index shifting issues
    indices.sort((a, b) => b - a);
    
    indices.forEach(index => {
        if (index >= 0 && index < data.length) {
            data.splice(index, 1);
        }
    });
    
    localStorage.setItem(dataType, JSON.stringify(data));
}

/**
 * Clear all data (with confirmation)
 * @param {string} dataType - Type of data to clear
 */
function clearAllData(dataType) {
    if (confirm(`Are you sure you want to delete all ${dataType}? This action cannot be undone.`)) {
        localStorage.removeItem(dataType);
        showNotification(`All ${dataType} have been deleted`, 'warning');
    }
}

// ============================================
// PRINT & REPORT FUNCTIONS
// ============================================

/**
 * Print table data
 * @param {string} tableId - ID of table to print
 */
function printTable(tableId) {
    const table = document.getElementById(tableId);
    
    if (!table) {
        alert('Table not found');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="style.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

/**
 * Generate CSV from table data
 * @param {string} tableId - ID of table
 * @param {string} filename - Filename for download
 */
function downloadTableAsCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    
    if (!table) {
        alert('Table not found');
        return;
    }
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        
        cols.forEach(col => {
            csvRow.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
        });
        
        csv.push(csvRow.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================
// RESPONSIVE UTILITIES
// ============================================

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get viewport width
 * @returns {number} Viewport width in pixels
 */
function getViewportWidth() {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
}

// ============================================
// ANIMATION UTILITIES
// ============================================

/**
 * Add fade-in animation to element
 * @param {HTMLElement} element - Element to animate
 */
function fadeIn(element) {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

/**
 * Add slide-in animation to element
 * @param {HTMLElement} element - Element to animate
 * @param {string} direction - Direction: 'left', 'right', 'up', 'down'
 */
function slideIn(element, direction = 'left') {
    const distances = {
        'left': '-100px',
        'right': '100px',
        'up': '100px',
        'down': '-100px'
    };
    
    element.style.transform = `translate${direction === 'left' || direction === 'right' ? 'X' : 'Y'}(${distances[direction]})`;
    element.style.opacity = '0';
    element.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        element.style.transform = 'translate(0)';
        element.style.opacity = '1';
    }, 10);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + S: Save (prevent default)
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            // Trigger save function if available
            if (typeof saveMedicine === 'function') {
                saveMedicine();
            }
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchBox = document.querySelector('.search-box');
            if (searchBox) {
                searchBox.focus();
            }
        }
    });
}

// Initialize keyboard shortcuts on page load
document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);

// ============================================
// PERFORMANCE & OPTIMIZATION
// ============================================

/**
 * Debounce function for search and filter operations
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 300) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function for scroll and resize events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// EXPORT FOR EXTERNAL USE
// ============================================

// Make functions globally available
window.checkLoginStatus = checkLoginStatus;
window.logout = logout;
window.setActiveNavigation = setActiveNavigation;
window.showNotification = showNotification;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.getMedicineStatistics = getMedicineStatistics;
window.getSalesStatistics = getSalesStatistics;
window.exportData = exportData;
window.printTable = printTable;
window.downloadTableAsCSV = downloadTableAsCSV;
window.isMobileDevice = isMobileDevice;
