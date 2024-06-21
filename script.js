 import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/app';
import 'firebase/auth';

// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCxZOkhqzccEFGtlwI7l_ToJjPUI3u9JDk",
    authDomain: "admin-panel-tp.firebaseapp.com",
    projectId: "admin-panel-tp",
    storageBucket: "admin-panel-tp.appspot.com",
    messagingSenderId: "368338391294",
    appId: "1:368338391294:web:11d88da1311b368f1615af",
    measurementId: "G-Q73853CEJ3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase Authentication
const auth = firebase.auth();document.getElementById('login').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            document.querySelector('.auth').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            document.getElementById('logout').style.display = 'block';
        })
        .catch((error) => {
            // Handle login errors
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password. Please try again.');
            } else if (errorCode === 'auth/user-not-found') {
                alert('User not found. Please check your email or sign up.');
            } else {
                alert(errorMessage);
            }
            console.error('Error signing in:', error);
        });
});


document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        document.querySelector('.auth').style.display = 'block';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('logout').style.display = 'none';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

auth.onAuthStateChanged((user) => {
    if (user) {
        document.querySelector('.auth').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('logout').style.display = 'block';
    } else {
        document.querySelector('.auth').style.display = 'block';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('logout').style.display = 'none';
    }
});
// Upload JSON for RAF
document.getElementById('json-file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('jsonFile', file);

    fetch('/api/raf-data', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('RAF JSON updated successfully');
    })
    .catch(error => {
        console.error('Error updating RAF JSON:', error);
    });
});

// Update Landing Page Data
document.getElementById('update-content-btn').addEventListener('click', function() {
    const formData = new FormData();
    
    // Add text fields
    formData.append('text', document.getElementById('text').value);
    formData.append('text2', document.getElementById('text2').value);

    // Add video files
    const videoEn = document.getElementById('video-en').files[0];
    if (videoEn) formData.append('videoEn', videoEn);
    
    const videoJp = document.getElementById('video-jp').files[0];
    if (videoJp) formData.append('videoJp', videoJp);

    const videoCn = document.getElementById('video-cn').files[0];
    if (videoCn) formData.append('videoCn', videoCn);

    // Add background files
    const backgroundEn = document.getElementById('background-en').files[0];
    if (backgroundEn) formData.append('backgroundEn', backgroundEn);

    const backgroundJp = document.getElementById('background-jp').files[0];
    if (backgroundJp) formData.append('backgroundJp', backgroundJp);

    const backgroundCn = document.getElementById('background-cn').files[0];
    if (backgroundCn) formData.append('backgroundCn', backgroundCn);

    // Add job for the week text
    formData.append('jobForTheWeek1', document.getElementById('jobForTheWeek1').value);
    formData.append('jobForTheWeek2', document.getElementById('jobForTheWeek2').value);

    // Add utm_source
    formData.append('utmSource', document.getElementById('utmSource').value);

    // Add excel file if any
    const excelFile = document.getElementById('excel-file').files[0];
    if (excelFile) formData.append('excelFile', excelFile);

    fetch('/api/update-landing-page', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('Landing Page content updated successfully');
    })
    .catch(error => {
        console.error('Error updating Landing Page content:', error);
    });
});