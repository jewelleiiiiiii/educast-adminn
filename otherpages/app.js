// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global array to hold all users for filtering
let allUsers = [];

// Fetch users from Firestore
async function fetchUsers() {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayUsers(allUsers);
}

// Function to display users based on filter and search
function displayUsers(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = ''; // Clear the existing rows

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.gradeLevel}</td>
            <td>${user.campus}</td>
            <td class="actions">
                <img src="../pics/edit.png" alt="Edit" onclick="editUser('${user.id}')">
                <img src="../pics/delete.png" alt="Delete" onclick="deleteUser('${user.id}')">
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter users by grade level
function filterUsers() {
    const selectedGrade = document.getElementById('gradeFilter').value;
    let filteredUsers = allUsers;

    if (selectedGrade !== 'All') {
        filteredUsers = filteredUsers.filter(user => user.gradeLevel === selectedGrade);
    }

    searchUsers(filteredUsers); // Apply search after filtering
}

// Search users by name or email
function searchUsers(filteredUsers = allUsers) {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const searchedUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery) ||
        user.lastName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
    );

    displayUsers(searchedUsers);
}

// Edit user function
async function editUser(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
        const user = userDoc.data();
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('gradeLevel').value = user.gradeLevel;
        document.getElementById('campus').value = user.campus;
        document.getElementById('editModal').style.display = 'block';

        // Save the updated details
        document.getElementById('editUserForm').onsubmit = async (e) => {
            e.preventDefault();
            await db.collection('users').doc(userId).update({
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                gradeLevel: document.getElementById('gradeLevel').value,
                campus: document.getElementById('campus').value,
            });
            document.getElementById('editModal').style.display = 'none';
            fetchUsers(); // Refresh the list
        };
    }
}

// Delete user function
async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        await db.collection('users').doc(userId).delete();
        fetchUsers(); // Refresh the list
    }
}

// Logout function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error logging out:', error);
    });
}

// Fetch users on page load
window.onload = fetchUsers;
