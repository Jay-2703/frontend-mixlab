const users = [
    {
        id: 1,
        username: "john_doe",
        email: "john.doe@example.com",
        role: "Student",
        registrationDate: "2024-01-15",
        status: "Active",
        xp: 2850,
        level: 8,
        xpForNextLevel: 3000,
        completedModules: 12,
        quizResults: "85%",
        progressPercentage: 65,
        badges: ["Fast Learner", "Quiz Master", "Perfect Attendance"],
        appointments: [
            { lesson: "JavaScript Basics", instructor: "Sarah Wilson", date: "2024-11-10", status: "Upcoming" },
            { lesson: "HTML & CSS", instructor: "Mike Johnson", date: "2024-11-01", status: "Completed" },
            { lesson: "React Fundamentals", instructor: "Sarah Wilson", date: "2024-10-28", status: "Completed" }
        ]
    },
    
    {
        id: 3,
        username: "mike_johnson",
        email: "mike.j@example.com",
        role: "Instructor",
        registrationDate: "2023-05-10",
        status: "Active",
        xp: 4890,
        level: 13,
        xpForNextLevel: 5000,
        completedModules: 25,
        quizResults: "88%",
        progressPercentage: 85,
        badges: ["CSS Guru", "Design Pro", "Mentor"],
        appointments: [
            { lesson: "UI/UX Design", instructor: "Self-taught", date: "2024-11-12", status: "Upcoming" }
        ]
    },
    {
        id: 4,
        username: "emily_brown",
        email: "emily.brown@example.com",
        role: "Student",
        registrationDate: "2024-09-05",
        status: "Active",
        xp: 1250,
        level: 4,
        xpForNextLevel: 1500,
        completedModules: 5,
        quizResults: "78%",
        progressPercentage: 35,
        badges: ["First Steps", "Early Bird"],
        appointments: [
            { lesson: "Python Basics", instructor: "David Lee", date: "2024-11-09", status: "Upcoming" },
            { lesson: "Introduction to Programming", instructor: "David Lee", date: "2024-10-30", status: "Completed" }
        ]
    },
    {
        id: 5,
        username: "alex_garcia",
        email: "alex.garcia@example.com",
        role: "Admin",
        registrationDate: "2023-01-01",
        status: "Active",
        xp: 8500,
        level: 25,
        xpForNextLevel: 10000,
        completedModules: 45,
        quizResults: "95%",
        progressPercentage: 100,
        badges: ["Platform Administrator", "System Expert", "All Modules Complete", "Legend"],
        appointments: []
    },
    {
        id: 6,
        username: "lisa_martin",
        email: "lisa.m@example.com",
        role: "Student",
        registrationDate: "2024-06-18",
        status: "Inactive",
        xp: 680,
        level: 2,
        xpForNextLevel: 1000,
        completedModules: 2,
        quizResults: "65%",
        progressPercentage: 15,
        badges: ["Beginner"],
        appointments: [
            { lesson: "Web Development Intro", instructor: "Mike Johnson", date: "2024-10-15", status: "Canceled" }
        ]
    },
    {
        id: 7,
        username: "david_lee",
        email: "david.lee@example.com",
        role: "Instructor",
        registrationDate: "2023-11-12",
        status: "Active",
        xp: 3950,
        level: 11,
        xpForNextLevel: 4500,
        completedModules: 20,
        quizResults: "90%",
        progressPercentage: 78,
        badges: ["Python Expert", "Code Reviewer", "Helpful"],
        appointments: [
            { lesson: "Data Structures", instructor: "Self-taught", date: "2024-11-14", status: "Upcoming" }
        ]
    },
    {
        id: 8,
        username: "jennifer_white",
        email: "jen.white@example.com",
        role: "Student",
        registrationDate: "2024-10-02",
        status: "Active",
        xp: 450,
        level: 1,
        xpForNextLevel: 500,
        completedModules: 1,
        quizResults: "72%",
        progressPercentage: 8,
        badges: ["Welcome Aboard"],
        appointments: [
            { lesson: "Getting Started", instructor: "Sarah Wilson", date: "2024-11-07", status: "Upcoming" }
        ]
    }
];

/* ========================================================
   ✅ Rendering User Table
======================================================== */

let filteredUsers = [...users];

function renderUsers(usersToRender) {
    const tbody = document.getElementById('userTableBody');
    const noResults = document.getElementById('noResults');

    tbody.innerHTML = '';

    if (usersToRender.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    usersToRender.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
            <td>${formatDate(user.registrationDate)}</td>
            <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status === 'Active' ? '✅' : '⛔'} ${user.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewUser(${user.id})">View Details</button>
                    <button class="btn btn-edit" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);

        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filteredUsers);
}

document.getElementById('searchInput').addEventListener('input', filterUsers);
document.getElementById('roleFilter').addEventListener('change', filterUsers);
document.getElementById('statusFilter').addEventListener('change', filterUsers);

/* ========================================================
   ✅ VIEW USER MODAL (Clean - No XP, Badges, Progress)
======================================================== */
/* ========================================================
   ✅ VIEW USER MODAL (Students show full data, Admin/Instructor basic only)
======================================================== */
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modalBody = document.getElementById('modalBody');

    // ✅ Base profile HTML for ALL ROLES
    let html = `
        <div class="user-profile">
            <div class="profile-item">
                <label>Username</label>
                <div class="value">${user.username}</div>
            </div>

            <div class="profile-item">
                <label>Email</label>
                <div class="value">${user.email}</div>
            </div>

            <div class="profile-item">
                <label>Role</label>
                <div class="value"><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></div>
            </div>

            <div class="profile-item">
                <label>Registration Date</label>
                <div class="value">${formatDate(user.registrationDate)}</div>
            </div>

            <div class="profile-item">
                <label>Status</label>
                <div class="value"><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></div>
            </div>
        </div>
    `;

    // ✅ Only STUDENTS get XP, progress, badges, appointments
    if (user.role === "Student") {
        
        // XP + Level
        html += `
            <h3 class="section-title">XP & Level Stats</h3>
            <div class="progress-stats">
                <div class="stat-card">
                    <div class="stat-value">${user.xp}</div>
                    <div class="stat-label">Current XP</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Level ${user.level}</div>
                    <div class="stat-label">Current Level</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${user.xpForNextLevel - user.xp}</div>
                    <div class="stat-label">XP to Next Level</div>
                </div>
            </div>
        `;

        // Learning Progress
        html += `
            <h3 class="section-title">Learning Progress</h3>
            <div class="user-profile">
                <div class="profile-item">
                    <label>Completed Modules</label>
                    <div class="value">${user.completedModules}</div>
                </div>
                <div class="profile-item">
                    <label>Quiz Results Average</label>
                    <div class="value">${user.quizResults}</div>
                </div>
                <div class="profile-item">
                    <label>Overall Progress</label>
                    <div class="value">${user.progressPercentage}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${user.progressPercentage}%"></div>
                    </div>
                </div>
            </div>
        `;

        // Badges
        html += `
            <h3 class="section-title">Badges & Rewards</h3>
            <div class="badges-container">
                ${user.badges.map(b => `<span class="badge-item">🏆 ${b}</span>`).join('')}
            </div>
        `;

        // Appointment History
        html += `
            <h3 class="section-title">Appointment History</h3>
            <div class="appointment-list">
                ${
                    user.appointments.length > 0
                    ? user.appointments.map(a => `
                        <div class="appointment-item">
                            <h4>${a.lesson}</h4>
                            <p><strong>Instructor:</strong> ${a.instructor}</p>
                            <p><strong>Date:</strong> ${formatDate(a.date)}</p>
                            <p><strong>Status:</strong> 
                                <span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span>
                            </p>
                        </div>
                    `).join('')
                    : `<p style="color:#777;">No appointment history.</p>`
                }
            </div>
        `;
    }

    modalBody.innerHTML = html;
    document.getElementById('userModal').classList.add('active');
}


function closeModal() {
    document.getElementById('userModal').classList.remove('active');
}

/* ========================================================
   ✅ EDIT USER MODAL (No alerts)
======================================================== */

let editingUserId = null;

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    editingUserId = userId;

    document.getElementById("editUsername").value = user.username;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editRole").value = user.role;
    document.getElementById("editStatus").value = user.status;

    document.getElementById("editModal").classList.add("active");
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("active");
}

document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const user = users.find(u => u.id === editingUserId);

    user.username = document.getElementById("editUsername").value;
    user.email = document.getElementById("editEmail").value;
    user.role = document.getElementById("editRole").value;
    user.status = document.getElementById("editStatus").value;

    closeEditModal();
    filterUsers();
});

/* ========================================================
   ✅ DELETE USER MODAL (No confirm)
======================================================== */

let deletingUserId = null;

function deleteUser(userId) {
    deletingUserId = userId;
    const user = users.find(u => u.id === userId);

    document.getElementById("deleteMessage").innerText =
        `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`;

    document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.remove("active");
}

function confirmDelete() {
    const index = users.findIndex(u => u.id === deletingUserId);
    users.splice(index, 1);

    closeDeleteModal();
    filterUsers();
}

/* ========================================================
   ✅ MODAL BACKDROP CLOSE
======================================================== */

window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === userModal) closeModal();
    if (event.target === editModal) closeEditModal();
    if (event.target === deleteModal) closeDeleteModal();
}

/* ========================================================
   ✅ INITIAL RENDER
======================================================== */

renderUsers(filteredUsers);
