import { account, databases } from 'appwrite-config.js';
import { payWithTelegramStars } from 'payment.js';

// Registration handler
document.getElementById('payBtn')?.addEventListener('click', async () => {
    const paid = await payWithTelegramStars(100);
    if (!paid) {
        alert('Payment failed!');
        return;
    }
    // Register user in Appwrite
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const dob = document.getElementById('dob').value;
    const password = document.getElementById('password').value;

    try {
        // Step 1: Create Appwrite user
        const user = await account.create('unique()', email, password, username);

        // Step 2: Store user details in database
        await databases.createDocument(
            'mainDB', // Your Database ID
            'usersCollection', // Your Collection ID
            user.$id, // Use Appwrite User ID as document ID for easy lookup
            {
                userId: user.$id,
                username: username,
                email: email,
                dob: dob,
                createdAt: new Date().toISOString()
            }
        );

        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
    }
});
