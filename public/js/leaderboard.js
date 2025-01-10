// Function to fetch leaderboard data from the server
function fetchLeaderboard() {
    fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = ''; // Clear existing data

            // Populate the leaderboard
            data.forEach((player, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="p-2 text-center">${index + 1}</td>
                    <td class="p-2">${player.username}</td>
                    <td class="p-2 text-center">${player.score}</td>
                `;
                leaderboardList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

// Fetch leaderboard data on page load
document.addEventListener('DOMContentLoaded', fetchLeaderboard);
