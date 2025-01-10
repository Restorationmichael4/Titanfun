document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    alert('Login successful!');
                    window.location.href = 'index.html';
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Error logging in:', error);
            }
        });
    }

    // Signup form handling
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                if (response.ok) {
                    alert('Signup successful!');
                    window.location.href = 'login.html';
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Signup failed.');
                }
            } catch (error) {
                console.error('Error signing up:', error);
            }
        });
    }
});
