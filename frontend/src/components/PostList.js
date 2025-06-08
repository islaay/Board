// /src/components/PostList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './PostList.css'; // 아래에 함께 정의된 스타일 파일

function PostList() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/posts')
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error('게시글 로딩 실패:', error);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 제목 또는 작성자에 검색어가 포함된 게시글만 필터링
  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const authorMatch = post.author?.username
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return titleMatch || authorMatch;
  });

  return (
    <div className="post-list-page-wrapper">
      {/* ─────────── 상단 헤더 ─────────── */}
      <header className="header">
        {/* 1) 윈도우 컨트롤 (왼쪽) */}
        <div className="window-controls">
          <span className="control yellow"></span>
          <span className="control green"></span>
          <span className="control red"></span>
        </div>

        {/* 2) 로고 (화면 중앙) */}
        <div className="logo">CHAEN&nbsp;BOARD</div>

        {/* 3) 네비게이션 버튼들 (오른쪽) */}
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="nav-btn" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </header>

      {/* ─────────── 콘텐츠 영역 ─────────── */}
      <main className="content-area">
        <h2 className="page-title">BOARD</h2>

        <div className="card-container">
          {/* 검색창 */}
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="제목이나 작성자로 검색하세요"
            />
          </div>

          {/* 게시판 테이블 */}
          <table className="post-table">
            <thead>
              <tr>
                <th className="col-num">번호</th>
                <th className="col-title">제목</th>
                <th className="col-author">작성자</th>
                <th className="col-date">작성날짜</th>
                <th className="col-file">파일</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, index) => (
                <tr key={post._id}>
                  <td className="col-num">{index + 1}</td>
                  <td className="col-title">
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </td>
                  <td className="col-author">
                    {post.author?.username || '알 수 없음'}
                  </td>
                  <td className="col-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="col-file">
                    {post.fileUrl ? (
                      <a
                        href={`http://localhost:5000/posts/${post._id}/download`}
                        className="download-link"
                      >
                        다운로드
                      </a>
                    ) : (
                      '없음'
                    )}
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-result">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 버튼 그룹 */}
          <div className="button-group">
            <button className="action-btn write-btn" onClick={() => navigate('/create-post')}>
              글쓰기
            </button>
            <button className="action-btn home-btn" onClick={() => navigate('/')}>
              홈으로
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PostList;