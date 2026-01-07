<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCrDsqjHbtEaXcH4fk0ARKFWcAWpJfHpys",
    authDomain: "family-app-ms14052015.firebaseapp.com",
    projectId: "family-app-ms14052015",
    storageBucket: "family-app-ms14052015.firebasestorage.app",
    messagingSenderId: "628614461190",
    appId: "1:628614461190:web:2187808cf601ac4ba9d087",
    measurementId: "G-QW30176FKV"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
