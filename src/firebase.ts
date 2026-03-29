import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAwS-LiuzlAvkV1j0DyQsW2dLF0flYrnJA",
  authDomain: "maanth-skills-india.firebaseapp.com",
  projectId: "maanth-skills-india",
  storageBucket: "maanth-skills-india.firebasestorage.app",
  messagingSenderId: "98876075178",
  appId: "1:98876075178:web:f81a059c93cc5ff0a5f4d3",
  measurementId: "G-80TT4SS8WF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
