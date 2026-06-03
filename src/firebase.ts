import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANMj2CWQma50hg-KLW0an5LmXZL76OGJU",
  authDomain: "cardcollection-30324.firebaseapp.com",
  projectId: "cardcollection-30324",
  storageBucket: "cardcollection-30324.firebasestorage.app",
  messagingSenderId: "353561121936",
  appId: "1:353561121936:web:28779bbc9b97e1b3b2f415",
  measurementId: "G-6M8NYMPX4E",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics는 브라우저 환경(secure context + IndexedDB 가용)에서만 활성화
analyticsSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {
    /* SSR/일부 브라우저에서 미지원 — 무시 */
  });
