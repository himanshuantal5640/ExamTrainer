// Handle login and signup
const authContainer = document.getElementById('authContainer');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const chatContainer = document.getElementById('chatContainer');
const historyContainer = document.getElementById('historyContainer');
const profileContainer = document.getElementById('profileContainer');
const historyList = document.getElementById('historyList');
const seeHistoryBtn = document.getElementById('seeHistoryBtn');
const backToChatBtn = document.getElementById('backToChatBtn');
const backToChatFromProfileBtn = document.getElementById('backToChatFromProfileBtn');
const userNameSpan = document.getElementById('userName');
const profileIcon = document.getElementById('profileIcon');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');

// Temporary storage for user credentials and history
let users = JSON.parse(localStorage.getItem('users')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let currentUser = null;

// Switch to signup form
showSignup.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    showLoginText.classList.remove('hidden');
    showSignup.classList.add('hidden');
});

// Switch to login form
showLogin.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    showLoginText.classList.add('hidden');
    showSignup.classList.remove('hidden');
});

// Handle signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        alert('This email is already registered. Please login.');
        return;
    }

    // Save the new user
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert(`Account created for ${name}! Please login.`);
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    showLoginText.classList.add('hidden');
    showSignup.classList.remove('hidden');
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        currentUser = user;
        // Store user information in local storage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        userNameSpan.textContent = user.name;
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Check if user is already logged in on page load
window.onload = () => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        userNameSpan.textContent = currentUser.name;
    }
};

// Logout functionality
function logout() {
    // Clear user information from local storage
    localStorage.removeItem('currentUser');
    currentUser = null;
    authContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
    profileContainer.classList.add('hidden'); // Hide profile container on logout
}

// Handle profile navigation
profileIcon.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');
    profileName.textContent = currentUser.name;
    profileEmail.textContent = currentUser.email;
});

// Back to chat from profile
backToChatFromProfileBtn.addEventListener('click', () => {
    profileContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
});

// Chatbot functionality
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { // Check if Enter is pressed without Shift
        e.preventDefault(); // Prevent new line
        sendMessage();
    }
});

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;

    // Create a new div for the user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message'); // Add classes for styling
    userMessageDiv.textContent = userInput; // Display the user's input
    document.querySelector('.chat-body').appendChild(userMessageDiv); // Append user message to chat body

    // Create a new div for the bot response
    const botResponseDiv = document.createElement('div');
    botResponseDiv.classList.add('message', 'bot-message'); // Add classes for styling
    botResponseDiv.innerHTML = 'Generating...'; // Temporary loading message
    document.querySelector('.chat-body').appendChild(botResponseDiv); // Append bot message to chat body

    // Normalize user input for easier comparison
    const normalizedInput = userInput.toLowerCase().trim();

    // Check for greetings
    if (normalizedInput === "hello" || normalizedInput === "hi" || normalizedInput === "hey") {
        botResponseDiv.textContent = "Hello! 👋 How can I assist you today?";
    } else if (normalizedInput === "can i pass without studying?") {
        botResponseDiv.textContent = "No, it's generally not advisable to pass without studying.";
    } else if (normalizedInput.includes("study plan")) {
        // Fetch the study plan from the API
        try {
            const response = await fetch('http://localhost:3000/api/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: userInput }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const plan = data.plan.split('\n').filter(line => line.trim() !== ''); // Get the study plan items
            
            // Format the study plan as bullet points
            botResponseDiv.innerHTML = '<h3>Your Study Plan:</h3>' +
                '<ul>' + // Use an unordered list for better formatting
                plan.map(item => `<li>${item}</li>`).join('') +
                '</ul>';

            // Save to history
            history.push({ input: userInput, plan: plan.join(', ') }); // Save the input and plan to history
            localStorage.setItem('history', JSON.stringify(history)); // Update local storage
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            botResponseDiv.textContent = 'Failed to generate study plan. Please try again later.';
        }
    } else {
        botResponseDiv.textContent = "I'm sorry, I didn't understand that. Can you please rephrase?";
    }

    // Clear the input field
    document.getElementById('userInput').value = '';

    // Scroll to the bottom of the chat body
    const chatBody = document.querySelector('.chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Show history
seeHistoryBtn.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    historyContainer.classList.remove('hidden');

    // Populate history
    historyList.innerHTML = history.map(item => `
        <li>
            <strong>Input:</strong> ${item.input}<br>
            <strong>Plan:</strong> ${item.plan}
        </li>
    `).join('');
});

// Back to chat from history
backToChatBtn.addEventListener('click', () => {
    historyContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
});

// Add event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', logout);
