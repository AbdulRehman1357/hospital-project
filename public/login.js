const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api' 
    : 'https://hospital-project-buhm.onrender.com/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and username
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminName', username);
            
            if (rememberMe) {
                localStorage.setItem('rememberEmail', username);
            }

            // Redirect to admin panel
            window.location.href = 'admin.html';
        } else {
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Error connecting to server. Please make sure the server is running.');
    }
});

// Pre-fill username if "Remember me" was checked
window.addEventListener('DOMContentLoaded', () => {
    const savedUsername = localStorage.getItem('rememberEmail');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
});
