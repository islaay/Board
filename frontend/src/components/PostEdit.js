// /src/components/PostEdit.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './PostEdit.css';

function PostEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [file, setFile] = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);

  // 1) 기존 데이터 불러오기
  useEffect(() => {
    axios
      .get(`http://localhost:5000/posts/${postId}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setContent(data.content);
        if (data.fileUrl) setExistingFileUrl(data.fileUrl);
      })
      .catch((err) => console.error('게시글 조회 실패:', err));
  }, [postId]);

  // 2) 파일 선택
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setRemoveExisting(false);
  };

  // 3) 기존 파일 삭제 토글
  const handleRemoveExisting = () => {
    setRemoveExisting(true);
    setFile(null);
  };

  // 4) 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('file', file);
    else if (removeExisting) formData.append('removeFile', 'true');

    try {
      await axios.put(
        `http://localhost:5000/posts/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      navigate(`/posts/${postId}`);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="post-edit-page-wrapper">
      {/* 상단 헤더 */}
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

      {/* 콘텐츠 영역 */}
      <main className="content-area">
        <div className="card-container">
          <h2 className="form-title">게시글 수정</h2>
          <form className="post-form" onSubmit={handleSubmit}>
            {/* 제목 */}
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

            {/* 내용 */}
            <div className="input-group">
              <label>내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
              />
            </div>

            {/* 기존 파일 표시 & 삭제 */}
            {existingFileUrl && !removeExisting && !file && (
              <div className="input-group file-group">
                <label>기존 파일</label>
                <div className="existing-file">
                  <a
                    href={`http://localhost:5000${existingFileUrl}`}
                    className="file-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {decodeURIComponent(existingFileUrl.split('/').pop())}
                  </a>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={handleRemoveExisting}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}

            {/* 새 파일 선택 */}
            <div className="input-group">
              <label>새 파일 업로드</label>
              <input
                type="file"
                accept="*/*"
                onChange={handleFileChange}
              />
              {file && (
                <p className="file-name">선택된 파일: {file.name}</p>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="button-group">
              <button type="submit" className="submit-btn">
                수정하기
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default PostEdit;