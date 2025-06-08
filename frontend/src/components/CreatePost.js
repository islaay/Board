// /src/components/CreatePost.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './CreatePost.css';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();

  // 수정 모드라면 기존 글 불러오기
  useEffect(() => {
    if (postId) {
      setIsEdit(true);
      axios
        .get(`http://localhost:5000/posts/${postId}`)
        .then((res) => {
          setTitle(res.data.title);
          setContent(res.data.content);
          // 파일 미리보기가 필요하면 res.data.fileUrl 사용
        })
        .catch((err) => console.error('게시글 조회 실패:', err));
    }
  }, [postId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후에만 이용 가능합니다.');
      return navigate('/login');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/posts/${postId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        await axios.post(
          'http://localhost:5000/posts',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      navigate('/posts');
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(
        `http://localhost:5000/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/posts');
    } catch (err) {
      console.error(err);
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="create-post-page-wrapper">
      {/* ─────────── 상단 헤더 ─────────── */}
      <header className="header">
        <div className="window-controls">
          <span className="control yellow" />
          <span className="control green" />
          <span className="control red" />
        </div>
        <div className="logo">CHAEN&nbsp;BOARD</div>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate('/')}>
            Home
          </button>
          <button className="nav-btn" onClick={() => navigate('/posts')}>
            게시판
          </button>
        </div>
      </header>

      {/* ─────────── 콘텐츠 영역 ─────────── */}
      <main className="content-area">
        <div className="card-container">
          <h2 className="form-title">{isEdit ? '게시글 수정' : '게시글 작성'}</h2>
          <form className="post-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
              />
            </div>
            <div className="input-group">
              <label>내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
              />
            </div>
            <div className="input-group">
              <label>파일 업로드</label>
              <input
                type="file"
                accept="*/*"
                onChange={handleFileChange}
              />
              {file && <p className="file-name">선택된 파일: {file.name}</p>}
            </div>
            <div className="button-group">
              <button type="submit" className="submit-btn">
                {isEdit ? '수정하기' : '작성하기'}
              </button>
              {isEdit && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDelete}
                >
                  삭제하기
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreatePost;