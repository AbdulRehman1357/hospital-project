const API_URL = 'http://localhost:3001/api';

// Load doctors on page load
document.addEventListener('DOMContentLoaded', loadDoctors);

// Load all doctors on initial page load
async function loadDoctors() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const doctors = await response.json();
        console.log('Doctors loaded:', doctors);
        
        // Display doctors on doctors page if we're on that page
        const doctorsGrid = document.getElementById('doctorsGrid');
        if (doctorsGrid) {
            displayDoctorsGrid(doctors);
        }
        
        // Update doctor select dropdown
        const doctorSelect = document.getElementById('doctor');
        if (doctorSelect) {
            // Clear existing options except the first one
            while (doctorSelect.options.length > 1) {
                doctorSelect.remove(1);
            }
            
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `Dr. ${doctor.name} - ${doctor.specialty}`;
                doctorSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        const doctorsGrid = document.getElementById('doctorsGrid');
        if (doctorsGrid) {
            doctorsGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; grid-column: 1/-1; color: red;">
                    <p>Error loading doctors. Make sure the server is running on http://localhost:3001</p>
                </div>
            `;
        }
    }
}

// Display doctors in grid on doctors page
function displayDoctorsGrid(doctors) {
    const doctorsGrid = document.getElementById('doctorsGrid');
    
    if (!doctors || doctors.length === 0) {
        doctorsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; grid-column: 1/-1;">
                <p>No doctors found</p>
            </div>
        `;
        return;
    }
    
    doctorsGrid.innerHTML = doctors.map(doctor => {
        const hasImage = doctor.image_url && doctor.image_url.trim() !== '';
        const rating = doctor.rating ? parseFloat(doctor.rating).toFixed(1) : 'N/A';
        
        return `
            <div class="doctor-card">
                <div class="doctor-avatar">
                    ${hasImage ? `<img src="${doctor.image_url}" alt="${doctor.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : '👨‍⚕️'}
                </div>
                <h3>${doctor.name}</h3>
                <p class="specialty">${doctor.specialty}</p>
                <p class="rating">⭐ ${rating}/5</p>
                <p>Experienced medical professional providing excellent patient care.</p>
                <a href="appointments.html" class="btn">Book Appointment</a>
            </div>
        `;
    }).join('');
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const doctor_id = document.getElementById('doctor').value;
    const appointment_date = document.getElementById('date').value;
    const appointment_time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    
    // Validate
    if (!fullname || !email || !phone || !doctor_id || !appointment_date || !appointment_time) {
        alert('Please fill in all required fields!');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patient_name: fullname,
                email: email,
                phone: phone,
                doctor_id: parseInt(doctor_id),
                appointment_date: appointment_date,
                appointment_time: appointment_time,
                message: message
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Thank you, ${fullname}!\n\nYour appointment has been booked successfully!\n\nAppointment ID: ${data.appointmentId}\n\nA confirmation email will be sent to ${email}`);
            event.target.reset();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error submitting appointment:', error);
        alert('Error booking appointment. Please make sure the server is running.');
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    // Show confirmation message
    alert(`Thank you for contacting us, ${name}!\n\nWe have received your message and will get back to you soon at ${email}.\n\nSubject: ${subject}`);
    
    // Reset form
    event.target.reset();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
