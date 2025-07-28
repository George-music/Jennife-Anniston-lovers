import { account, databases } from './appwrite-config.js';

const DB_ID = 'mainDB';
const USERS_COLLECTION = 'usersCollection';

let currentProfile = null;

// Load user profile and update UI
export async function loadProfile() {
    try {
        const user = await account.get();
        // Fetch profile from database
        const profile = await databases.getDocument(DB_ID, USERS_COLLECTION, user.$id);
        currentProfile = profile;
        document.getElementById('profileUsername').innerText = profile.username;
        document.getElementById('profileEmail').innerText = profile.email;
        document.getElementById('profileDOB').innerText = "DOB: " + profile.dob;
        // Set dark mode toggle
        const darkToggle = document.getElementById('darkModeToggle');
        if (profile.darkMode) {
            document.body.classList.add('dark-mode');
            darkToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkToggle.checked = false;
        }
    } catch (error) {
        window.location.href = "login.html";
    }
}
loadProfile();

// Dark mode toggle logic
document.getElementById('darkModeToggle').addEventListener('change', async (e) => {
    const isDark = e.target.checked;
    document.body.classList.toggle('dark-mode', isDark);
    if (currentProfile) {
        await databases.updateDocument(DB_ID, USERS_COLLECTION, currentProfile.$id, {
            darkMode: isDark
        });
        currentProfile.darkMode = isDark;
    }
});

// Open profile edit modal
document.getElementById('profileBtn')?.addEventListener('click', () => {
    if (!currentProfile) return;
    document.getElementById('editProfileModal').classList.add('show');
    document.getElementById('editUsername').value = currentProfile.username;
    document.getElementById('editEmail').value = currentProfile.email;
    document.getElementById('editDOB').value = currentProfile.dob;
    document.getElementById('editDarkMode').checked = !!currentProfile.darkMode;
});

// Close modal
document.getElementById('closeProfileModal').addEventListener('click', () => {
    document.getElementById('editProfileModal').classList.remove('show');
});

// Save profile changes
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const newUsername = document.getElementById('editUsername').value;
    const newEmail = document.getElementById('editEmail').value;
    const newDOB = document.getElementById('editDOB').value;
    const newDarkMode = document.getElementById('editDarkMode').checked;

    try {
        // Update database
        await databases.updateDocument(DB_ID, USERS_COLLECTION, currentProfile.$id, {
            username: newUsername,
            email: newEmail,
            dob: newDOB,
            darkMode: newDarkMode
        });
        // Optionally update Appwrite Account email and name (if changed)
        if (newUsername !== currentProfile.username) {
            await account.updateName(newUsername);
        }
        if (newEmail !== currentProfile.email) {
            await account.updateEmail(newEmail, prompt("Enter your password to change email:"));
        }
        // Update UI
        document.getElementById('profileUsername').innerText = newUsername;
        document.getElementById('profileEmail').innerText = newEmail;
        document.getElementById('profileDOB').innerText = "DOB: " + newDOB;
        document.body.classList.toggle('dark-mode', newDarkMode);
        document.getElementById('editProfileModal').classList.remove('show');
        // Update cached profile
        currentProfile.username = newUsername;
        currentProfile.email = newEmail;
        currentProfile.dob = newDOB;
        currentProfile.darkMode = newDarkMode;
        alert('Profile updated successfully!');
    } catch (error) {
        alert('Failed to update profile: ' + error.message);
    }
});

// Logout
document.getElementById('logoutBtn').onclick = async () => {
    await account.deleteSession('current');
    window.location.href = "login.html";
};

// You can add more advanced management, such as password change, profile picture, etc.
// Example: Password change
document.getElementById('changePasswordBtn')?.addEventListener('click', async () => {
    const newPass = prompt("Enter new password:");
    if (newPass) {
        await account.updatePassword(newPass, prompt("Enter your current password:"));
        alert('Password updated!');
    }
});
