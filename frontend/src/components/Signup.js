// /src/components/Signup.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // 아래에 정의된 스타일 파일

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 회원가입 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password,
      });
      console.log('회원가입 성공:', response.data);
      // 회원가입 성공 후 로그인 페이지로 이동
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입에 실패했습니다. 입력 정보를 다시 확인해주세요.');
    }
  };

  // 홈으로 가기 버튼
  const handleHome = () => {
    navigate('/');
  };

  // 로그인 페이지로 이동 버튼
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="signup-page-wrapper">
      {/* ─────────── 상단 헤더 ─────────── */}
      <header className="header">
        <div className="window-controls">
          <span className="control yellow"></span>
          <span className="control green"></span>
          <span className="control red"></span>
        </div>

        <div className="logo">CHAEN&nbsp;BOARD</div>

        <div className="nav-buttons">
          <button className="nav-btn" onClick={handleHome}>
            Home
          </button>
          <button className="nav-btn" onClick={handleLogin}>
            로그인
          </button>
        </div>
      </header>

      {/* ─────────── 회원가입 카드 ─────────── */}
      <main className="signup-container">
        <div className="signup-card">
          <h2 className="signup-title">회원가입</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            {/* 사용자 이름 입력 */}
            <div className="input-group">
              <label htmlFor="username">사용자 이름</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="예: 홍길동"
                required
              />
            </div>
            {/* 이메일 입력 */}
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
            {/* 비밀번호 입력 */}
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
            {/* 제출 버튼 */}
            <button type="submit" className="submit-btn">
              회원가입
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Signup;
