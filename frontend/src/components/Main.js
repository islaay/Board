// /src/components/Main.js

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MainPage.css';

function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // * 이 ref는 “지금 unload 이벤트가 키보드 새로고침(F5, Ctrl+R) 때문인지”를 표시합니다.
  const isReloadingRef = useRef(false);

  useEffect(() => {
    // 1) 페이지 로드 시 로그인된 사용자 정보 가져오기
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5000/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('로그인된 사용자 정보 가져오기 실패:', error);
          localStorage.removeItem('token');
          setUser(null);
        });
    }

    // 2) 키보드 새로고침(F5, Ctrl+R) 감지 핸들러
    const handleKeydown = (e) => {
      // e.key === 'F5' 혹은 e.ctrlKey && (e.key === 'r' 또는 'R')
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        isReloadingRef.current = true;
      }
    };
    window.addEventListener('keydown', handleKeydown);

    // 3) 언로드 이벤트: 탭/창 종료(또는 주소창 직접 이동 등) 시 호출
    const handleBeforeUnload = (e) => {
      // 키보드 새로고침(F5/Ctrl+R)이 아닌 경우에만 로그아웃 처리
      if (!isReloadingRef.current) {
        localStorage.removeItem('token');
        setUser(null);
      }
      // (팝업창을 띄우고 싶으면 아래 주석 해제, 대화상자 출력)
      // e.preventDefault();
      // return (e.returnValue = '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 4) Cleanup: 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 로그아웃 버튼 클릭 시
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    alert('로그아웃되었습니다.');
  };

  // 게시판 이동 시 로그인 여부 체크
  const handleBoardClick = () => {
    if (!user) {
      alert('게시판을 이용하려면 먼저 로그인해주세요.');
      navigate('/login');
    } else {
      navigate('/posts');
    }
  };

  return (
    <div className="main-wrapper">
      {/* ─────────── 상단 헤더 ─────────── */}
      <header className="header">
        <div className="window-controls">
          <span className="control yellow"></span>
          <span className="control green"></span>
          <span className="control red"></span>
        </div>

        <div className="logo">CHAEN&nbsp;BOARD</div>

        <div className="nav-buttons">
                  <button className="bar-btn" onClick={handleBoardClick}>
          <i className="fas fa-calendar"></i>게시판
        </button>
        </div>
      </header>

      {/* ─────────── 중앙 콘텐츠 ─────────── */}
      <main className="content">
        {/* 로그인 상태라면 상단에 인사말(Hello, {username}) 표시 */}
        {user && (
          <p className="small-title">
            Hello, <span className="username">{user.username}</span>!
          </p>
        )}
        <h1 className="main-title">
          Cyberone&nbsp;Board
        </h1>
      </main>

      {/* ─────────── 하단 바 ─────────── */}
      <div className="bottom-bar">
        {user ? (
          <>
            <button className="bar-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>로그아웃
            </button>
          </>
        ) : (
          <>
            <button className="bar-btn" onClick={() => navigate('/login')}>
              <i className="fas fa-sign-in-alt"></i>로그인
            </button>

               <div className="separator" />

            <button
              className="bar-btn"
              onClick={() => navigate('/signup')}
              style={{ marginLeft: '8px' }}
            >
              <i className="fas fa-user-plus"></i>회원가입
                    <div className="down-arrow">
              <i className="fas fa-chevron-down"></i>
            </div>
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default MainPage;