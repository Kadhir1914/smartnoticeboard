import { initializeApp } from "firebase/app";

export const firebaseConfig = {
    apiKey: "AIzaSyDfK3S476snDq5S7YeRc6wh6kItqsc-Ub8",
    authDomain: "smart-notice-board-bd2e2.firebaseapp.com",
    projectId: "smart-notice-board-bd2e2",
    storageBucket: "smart-notice-board-bd2e2.firebasestorage.app",
    messagingSenderId: "77626982604",
    appId: "1:77626982604:web:0f76d25e36283af34bc269"
};

export const app = initializeApp(firebaseConfig);