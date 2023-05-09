import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // 유저 정보를 상태로 관리합니다.

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setUser(firebaseUser); // 로그인된 경우 유저 정보를 설정합니다.
      } else {
        setIsLoggedIn(false);
        setUser(null); // 로그아웃된 경우 유저 정보를 초기화합니다.
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user }}> {/* user 정보를 AuthContext로 전달합니다. */}
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;