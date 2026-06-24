const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api' 
    : 'https://hospital-project-buhm.onrender.com/api';
// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    const adminName = localStorage.getItem('adminName');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Set admin name
    document.getElementById('adminName').textContent = adminName || 'Admin';

    // Load appointments
    loadAppointments();

    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadAppointments);

    // Doctor management
    if (document.getElementById('addDoctorBtn')) {
        document.getElementById('addDoctorBtn').addEventListener('click', () => openDoctorModal());
    }

    if (document.getElementById('doctorForm')) {
        document.getElementById('doctorForm').addEventListener('submit', submitDoctorForm);
    }

    if (document.getElementById('doctorPhoto')) {
        document.getElementById('doctorPhoto').addEventListener('change', handleImageUpload);
    }

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('doctorModal');
        if (e.target === modal) {
            closeDoctorModal();
        }
    });
}

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });

    // Remove active from nav
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Set active nav item
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Load data if needed
    if (section === 'statistics') {
        loadStatistics();
    } else if (section === 'doctors') {
        loadDoctors();
    }
}

async function loadAppointments() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        const appointments = await response.json();
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        alert('Error loading appointments');
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');

    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox"></i> No appointments found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>#${apt.id}</td>
            <td>${apt.patient_name}</td>
            <td>${apt.email}</td>
            <td>${apt.phone}</td>
            <td>${apt.doctor_name || 'N/A'}</td>
            <td>${formatDate(apt.appointment_date)}</td>
            <td>${apt.appointment_time}</td>
            <td>
                <span class="status-badge ${apt.status}">
                    ${apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-confirm" onclick="updateStatus(${apt.id}, 'confirmed')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-small btn-cancel" onclick="updateStatus(${apt.id}, 'cancelled')">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteAppointment(${apt.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadStatistics() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const appointments = await response.json();

        const stats = {
            total: appointments.length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            pending: appointments.filter(a => a.status === 'pending').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length
        };

        document.getElementById('totalAppointments').textContent = stats.total;
        document.getElementById('confirmedAppointments').textContent = stats.confirmed;
        document.getElementById('pendingAppointments').textContent = stats.pending;
        document.getElementById('cancelledAppointments').textContent = stats.cancelled;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function updateStatus(appointmentId, status) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: status })
        });

        if (response.ok) {
            alert('Appointment status updated');
            loadAppointments();
        } else {
            alert('Error updating appointment');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
    }
}

async function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Appointment deleted');
            loadAppointments();
        } else {
            alert('Error deleting appointment');
        }
    } catch (error) {
        console.error('Error deleting appointment:', error);
    }
}

// Doctor Management Functions
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        const doctors = await response.json();
        displayDoctors(doctors);
    } catch (error) {
        console.error('Error loading doctors:', error);
        alert('Error loading doctors');
    }
}

function displayDoctors(doctors) {
    const tbody = document.getElementById('doctorsTableBody');

    if (doctors.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox"></i> No doctors found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = doctors.map(doctor => `
        <tr>
            <td>#${doctor.id}</td>
            <td>
                ${doctor.image_url ? `<img src="${doctor.image_url}" alt="${doctor.name}" class="doctor-photo">` : '<div style="width: 50px; height: 50px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user"></i></div>'}
            </td>
            <td>${doctor.name}</td>
            <td>${doctor.specialty}</td>
            <td>${doctor.email || 'N/A'}</td>
            <td>${doctor.phone || 'N/A'}</td>
            <td>${doctor.rating ? doctor.rating + '/5' : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-small btn-confirm" onclick="editDoctor(${doctor.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteDoctor(${doctor.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openDoctorModal(editingDoctorId = null) {
    const modal = document.getElementById('doctorModal');
    const form = document.getElementById('doctorForm');
    const modalTitle = document.getElementById('modalTitle');

    // Reset and clear previous data
    form.reset();
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').innerHTML = '';
    form.dataset.doctorId = '';

    if (editingDoctorId) {
        modalTitle.textContent = 'Edit Doctor';
        form.dataset.doctorId = String(editingDoctorId); // Ensure it's a string
        // Load doctor data and populate form
        loadDoctorForEdit(editingDoctorId);
    } else {
        modalTitle.textContent = 'Add Doctor';
    }

    modal.classList.add('show');
}

async function loadDoctorForEdit(doctorId) {
    try {
        const response = await fetch(`${API_URL}/doctors/${doctorId}`);
        const doctor = await response.json();

        document.getElementById('doctorName').value = doctor.name;
        document.getElementById('doctorSpecialty').value = doctor.specialty;
        document.getElementById('doctorEmail').value = doctor.email || '';
        document.getElementById('doctorPhone').value = doctor.phone || '';
        document.getElementById('doctorRating').value = doctor.rating || '';

        const preview = document.getElementById('photoPreview');
        if (doctor.image_url) {
            preview.innerHTML = `<img src="${doctor.image_url}" alt="${doctor.name}">`;
            preview.style.display = 'flex';
        } else {
            preview.style.display = 'none';
            preview.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading doctor:', error);
        alert('Error loading doctor details');
    }
}

function closeDoctorModal() {
    const modal = document.getElementById('doctorModal');
    modal.classList.remove('show');
    document.getElementById('doctorForm').reset();
    document.getElementById('photoPreview').style.display = 'none';
    document.getElementById('photoPreview').innerHTML = '';
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            preview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
}

async function submitDoctorForm(e) {
    e.preventDefault();

    const doctorId = document.getElementById('doctorForm').dataset.doctorId;
    const name = document.getElementById('doctorName').value;
    const specialty = document.getElementById('doctorSpecialty').value;
    const email = document.getElementById('doctorEmail').value;
    const phone = document.getElementById('doctorPhone').value;
    const rating = document.getElementById('doctorRating').value;
    const photoFile = document.getElementById('doctorPhoto').files[0];

    // Validation
    if (!name.trim() || !specialty.trim()) {
        alert('Doctor name and specialty are required!');
        return;
    }

    let imageUrl = '';

    // Handle image upload with compression
    if (photoFile) {
        imageUrl = await compressImage(photoFile);
    }

    try {
        const token = localStorage.getItem('adminToken');
        const isEditing = doctorId && doctorId !== '';
        const url = isEditing ? `${API_URL}/doctors/${doctorId}` : `${API_URL}/doctors`;
        const method = isEditing ? 'PUT' : 'POST';

        console.log(`${method} request to ${url} with doctorId: ${doctorId || 'new'}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name.trim(),
                specialty: specialty.trim(),
                email: email.trim() || null,
                phone: phone.trim() || null,
                rating: rating ? parseFloat(rating) : null,
                image_url: imageUrl
            })
        });

        const responseData = await response.json();

        if (response.ok) {
            alert(isEditing ? 'Doctor updated successfully' : 'Doctor added successfully');
            closeDoctorModal();
            loadDoctors();
        } else {
            console.error('Error response:', responseData);
            alert('Error saving doctor: ' + (responseData.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting doctor form:', error);
        alert('Error saving doctor: ' + error.message);
    }
}

// Image compression function
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 500;
                const maxHeight = 500;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function editDoctor(doctorId) {
    openDoctorModal(doctorId);
}

async function deleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to delete this doctor?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_URL}/doctors/${doctorId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Doctor deleted successfully');
            loadDoctors();
        } else {
            alert('Error deleting doctor');
        }
    } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Error deleting doctor');
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = 'index.html';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
