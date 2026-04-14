// Navbar Functionality
const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-bars');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('active');
        if (menuToggle) {
            menuToggle.querySelector('i').classList.add('fa-bars');
            menuToggle.querySelector('i').classList.remove('fa-times');
        }
    });
});

// DOM Elements - UPDATED TO MATCH YOUR HTML
const uploadAreas = document.querySelectorAll('.upload-area');
const imageInput = document.getElementById('imageInput');
const videoInput = document.getElementById('videoInput');
const resultContainer = document.querySelector('.result-container');
const contactForm = document.getElementById('contactForm');
const searchButton = document.getElementById('searchButton');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');
const searchResults = document.getElementById('searchResults');

// Drag and Drop Event Listeners for BOTH upload areas
uploadAreas.forEach((area) => {
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        area.style.borderColor = '#60A5FA';
    });

    area.addEventListener('dragleave', () => {
        area.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        area.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        area.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0], area);
        }
    });
});

// File Input Change Events
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            // Find the parent upload area to show the loading spinner in the right place
            handleFile(e.target.files[0], e.target.closest('.upload-area'));
        }
    });
}

if (videoInput) {
    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0], e.target.closest('.upload-area'));
        }
    });
}

// Get User Data from Login
const getUserData = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Handle File Upload
function handleFile(file, activeArea) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please upload an image or video file.');
        return;
    }

    const user = getUserData();
    if (!user || !user.api_key) {
        showError('Please login to use the detection feature.');
        window.location.href = '/login.html';
        return;
    }

    detectDeepfake(file, user.api_key, activeArea);
}

// File Detection via Python API
const detectDeepfake = async (file, apiKey, activeArea) => {
    const formData = new FormData();
    formData.append('file', file);

    // Show loading state in the specific box clicked
    let originalContent = '';
    if (activeArea) {
        originalContent = activeArea.innerHTML;
        activeArea.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: #60A5FA; margin-bottom: 1.5rem;"></i><h3 style="margin-bottom: 1rem;">Analyzing Media</h3><p>Our AI is actively processing this file. Please wait...</p>';
    }

    try {
        const response = await fetch(`/api/detect`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
            },
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            displayResults(data);
        } else {
            showError(data.error || 'Detection failed');
        }
    } catch (error) {
        showError('Network error during detection. Is the Python server running?');
    } finally {
        // Restore the original HTML (buttons and icons)
        if (activeArea) {
            activeArea.innerHTML = originalContent;
        }
    }
};

// Results Display
const displayResults = (results) => {
    if (!resultContainer) return;
    
    const progressBars = resultContainer.querySelectorAll('.progress');
    
    if (progressBars.length >= 2) {
        progressBars[0].style.width = `${(results.manipulation_score * 100).toFixed(1)}%`;
        // Change color based on manipulation score (Red if high probability)
        if (results.manipulation_score > 0.6) {
            progressBars[0].style.backgroundColor = '#ef4444'; 
        } else {
            progressBars[0].style.backgroundColor = '#22c55e';
        }

        progressBars[1].style.width = `${(results.confidence * 100).toFixed(1)}%`;
        progressBars[1].style.backgroundColor = '#3b82f6';
    }

    resultContainer.style.display = 'block';

    const oldAnalysis = resultContainer.querySelector('.facial-analysis');
    if (oldAnalysis) oldAnalysis.remove();

    if (results.facial_analysis) {
        const analysisHtml = `
            <div class="facial-analysis" style="margin-top: 25px; padding: 20px; background: rgba(59, 130, 246, 0.1); border-radius: 10px; border: 1px solid rgba(59, 130, 246, 0.2);">
                <h4 style="margin-bottom: 15px; color: #60A5FA; font-size: 1.2rem;">DeepFace Subject Analysis</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: rgba(255,255,255,0.8);">
                    <p><strong>Estimated Age:</strong> ${results.facial_analysis.age}</p>
                    <p><strong>Primary Emotion:</strong> <span style="text-transform: capitalize;">${results.facial_analysis.dominant_emotion}</span></p>
                    <p><strong>Gender ID:</strong> <span style="text-transform: capitalize;">${results.facial_analysis.dominant_gender || 'N/A'}</span></p>
                    <p><strong>Dominant Race:</strong> <span style="text-transform: capitalize;">${results.facial_analysis.dominant_race}</span></p>
                </div>
            </div>
        `;
        resultContainer.insertAdjacentHTML('beforeend', analysisHtml);
    }
    
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Contact Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            message: document.getElementById('message').value,
        };

        try {
            const response = await fetch(`/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                alert('Success: Message sent successfully!');
                event.target.reset();
            } else {
                alert(`Error: ${data.error || 'Failed to send message'}`);
            }
        } catch (error) {
            alert('Error: Network error while sending message');
        }
    });
}

const showError = (message) => { alert(`Error: ${message}`); };

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Search functionality
function openSearch(e) {
    if (e) e.preventDefault();
    if(searchModal) {
        searchModal.classList.add('active');
        if(searchInput) searchInput.focus();
    }
}

function closeSearchModal() {
    if(searchModal) searchModal.classList.remove('active');
}

if (searchButton) searchButton.addEventListener('click', openSearch);
if (closeSearch) closeSearch.addEventListener('click', closeSearchModal);

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModal?.classList.contains('active')) {
            closeSearchModal();
        } else {
            openSearch();
        }
    }
    if (e.key === 'Escape' && searchModal?.classList.contains('active')) {
        closeSearchModal();
    }
});

// Dropdown hover effect
const dropdowns = document.querySelectorAll('.nav-item');
dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.dropdown-menu');
    let timeoutId;
    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
        dropdowns.forEach(d => {
            if (d !== dropdown) {
                d.querySelector('.dropdown-menu')?.classList.remove('active');
            }
        });
        menu?.classList.add('active');
    });
    dropdown.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
            menu?.classList.remove('active');
        }, 100);
    });
});