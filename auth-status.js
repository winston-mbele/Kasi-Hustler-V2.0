// auth-status.js
// Checks login status, updates nav bar, handles role-based profile links.

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { auth, db } from './firebase-config.js';

// --- Logout Function ---
async function handleLogout() {
    try {
        await signOut(auth);
        // Clear all relevant local storage items
        Object.keys(localStorage).forEach(key => {
            // Remove profile images, business logos, user role, and user name
            if (key.startsWith('userProfileImage_') || key.startsWith('businessLogo_') || key === 'userRole' || key === 'userName') {
                localStorage.removeItem(key);
            }
        });
        window.location.href = 'index.html'; // Redirect to home after logout
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// --- Update Profile UI Function (Handles Dropdown) ---
async function updateProfileUI(user) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer || !user) return; // Exit if elements are missing

    // --- 1. Get Role and Name (Prioritize Local Storage) ---
    let userRole = localStorage.getItem('userRole');
    let userName = localStorage.getItem('userName'); // Use consistent key 'userName'
    let profileImageSrc = 'default-profile-picture.png'; // Default avatar
    let profileLink = 'myprofile.html'; // Default link for Personal
    let imageKey = `userProfileImage_${user.uid}`; // Default image key for Personal

    // Fallback: Fetch from Firestore if localStorage is empty or role is unknown
    if (!userRole || !userName) {
        console.log("[Auth Status] Role or Name not in localStorage, fetching from Firestore...");
        const userDocRef = doc(db, "users", user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                userRole = data.role || 'Personal'; // Default to Personal if missing
                userName = data.fullName || user.displayName || 'My Account'; // Use fullName from DB

                // Save fetched data to localStorage
                localStorage.setItem('userRole', userRole);
                localStorage.setItem('userName', userName);
            } else {
                 // User exists in Auth but not Firestore - treat as Personal
                 console.warn("[Auth Status] User document not found in Firestore. Defaulting to Personal role.");
                 userRole = 'Personal';
                 userName = user.displayName || 'My Account';
                 localStorage.setItem('userRole', userRole);
                 localStorage.setItem('userName', userName);
            }
        } catch (error) {
            console.error("[Auth Status] Error fetching user data:", error);
            // Stick with defaults if Firestore fetch fails
            userRole = 'Personal';
            userName = user.displayName || 'My Account';
        }
    }

    // --- 2. Determine Profile Link and Image Key based on Role (UPDATED for 2 roles) ---
    if (userRole === 'Service Provider') {
        profileLink = 'business-profile.html'; // Service Providers now use this repurposed file
        imageKey = `businessLogo_${user.uid}`; // Use the logo key previously used for Business
    } else { // Handles 'Personal' or any unexpected role
        profileLink = 'myprofile.html';
        imageKey = `userProfileImage_${user.uid}`;
    }

    // Retrieve the correct image source from localStorage
    profileImageSrc = localStorage.getItem(imageKey) || profileImageSrc; // Use determined key
    userName = userName || user.displayName || 'My Account'; // Ensure userName has a fallback

    // --- 3. Build and Inject Dropdown HTML ---
    authContainer.innerHTML = `
        <div class="profile-nav-container">
            <button class="profile-nav-btn" title="My Profile" id="profile-btn">
                <img src="${profileImageSrc}" alt="${userName}'s Profile/Logo">
            </button>
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-header">${userName}</div>
                <a href="${profileLink}" class="dropdown-item"><i class="fas fa-user-circle"></i> My Profile</a>
                <a href="notifications.html" class="dropdown-item"><i class="fas fa-bell"></i> Notifications</a>
                <a href="chat.html" class="dropdown-item"><i class="fas fa-comments"></i> Messages</a>
                <a href="#" class="dropdown-item dropdown-logout" id="dropdown-logout-btn"><i class="fas fa-sign-out-alt"></i> Log Out</a>
            </div>
        </div>
    `;

    // --- 4. Attach Event Listeners ---
    const profileBtn = document.getElementById('profile-btn');
    const dropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('dropdown-logout-btn');
    const profileImg = profileBtn?.querySelector('img');

    // Toggle Dropdown
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing dropdown immediately
        dropdown.classList.toggle('active');
    });

    // Logout Button
    logoutBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        // Check if dropdown exists and is active before trying to close
        if (dropdown && dropdown.classList.contains('active') && !authContainer.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Listen for custom events to update image/name without full reload
    window.addEventListener('storage:logoUpdate', (e) => {
        // Check if the updated key matches the current user's expected image key
        if (profileImg && e.detail.key === imageKey) {
            profileImg.src = e.detail.value;
        }
    });
    window.addEventListener('storage:nameUpdate', () => {
        // Re-run UI update to get the new name from localStorage
        updateProfileUI(user);
    });

    // Make container visible
    authContainer.classList.remove('waiting-auth');
}

// --- Initialize Auth Listener ---
document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, update the UI dynamically
            await updateProfileUI(user); // Wait for potential Firestore fetch
        } else {
            // User is signed out, show login button
            if (authContainer) {
                authContainer.innerHTML = `<a href="auth.html" class="nav-link btn-auth">Sign Up / Login</a>`;
                authContainer.classList.remove('waiting-auth');
            }
        }
    });
});

