// Function to handle user sign-up
function handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!username || !password) {
        alert('All fields are required!');
        return;
    }

    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Sign-up successful! Please log in.');
                document.getElementById('signup-form').reset();
            } else {
                alert(data.message || 'Error during sign-up.');
            }
        })
        .catch(error => console.error('Error signing up:', error));
}

// Function to handle user login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        alert('All fields are required!');
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Login successful!');
                fetchUserScores(username); // Load the user's scores
            } else {
                alert(data.message || 'Error during login.');
            }
        })
        .catch(error => console.error('Error logging in:', error));
}

// Function to fetch user trivia scores
function fetchUserScores(username) {
    fetch(`/api/scores?username=${username}`)
        .then(response => response.json())
        .then(data => {
            const scoresList = document.getElementById('user-scores');
            scoresList.innerHTML = ''; // Clear existing scores

            data.forEach(score => {
                const listItem = document.createElement('li');
                listItem.textContent = `Score: ${score.score} (Date: ${score.date})`;
                scoresList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching user scores:', error));
}

// Attach event listeners to forms
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});
