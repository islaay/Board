// /src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 아래에 정의한 스타일 파일

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { 
        email, 
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);

      console.log('로그인 성공:', response.data);
      navigate('/'); // 로그인 성공 후 메인 페이지로 이동
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패하였습니다. 이메일과 비밀번호를 확인하세요.');
    }
  };

  // 버튼 클릭 시 라우팅
  const handleHome = () => {
    navigate('/');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page-wrapper">
      {/* ─────────── 상단 헤더 ─────────── */}
      <header className="header">
        <div className="window-controls">
          <span className="control yellow"></span>
          <span className="control green"></span>
          <span className="control red"></span>
        </div>

        <div className="logo">CHAEN&nbsp;BOARD</div>

        <div className="nav-buttons">
          <button 
            className="nav-btn" 
            onClick={handleHome}
          >
            Home
          </button>
          <button 
            className="nav-btn" 
            onClick={handleSignup}
          >
            회원가입
          </button>
        </div>
      </header>

      {/* ─────────── 로그인 카드 ─────────── */}
      <main className="login-container">
        <div className="login-card">
          <h2 className="login-title">로그인</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              로그인
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Login;