// /src/components/PostDetail.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './PostDetail.css';

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);

  // 1) 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:5000/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  // 2) 게시글 상세 & 댓글 조회
  useEffect(() => {
    axios
      .get(`http://localhost:5000/posts/${postId}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error('게시글 상세 조회 실패:', err));

    axios
      .get(`http://localhost:5000/comments/${postId}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error('댓글 조회 실패:', err));
  }, [postId]);

  // 3) 게시글 삭제
  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('게시글이 삭제되었습니다.');
      navigate('/posts');
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  // 4) 수정 페이지로 이동
  const handleEdit = () => {
    navigate(`/posts/edit/${postId}`);
  };

  // 5) 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('댓글을 작성하려면 로그인해주세요.');
      return navigate('/login');
    }
    try {
      const res = await axios.post(
        `http://localhost:5000/comments`,
        { postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('댓글 작성 실패:', err);
    }
  };

  // 6) 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };

  // 7) 댓글 수정
  const handleCommentEdit = (commentId, originalContent) => {
    const content = prompt('수정할 내용을 입력하세요:', originalContent);
    if (!content) return;
    const token = localStorage.getItem('token');
    axios
      .put(
        `http://localhost:5000/comments/${commentId}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) =>
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? res.data : c))
        )
      )
      .catch((err) => console.error('댓글 수정 실패:', err));
  };

  if (!post) {
    return <div className="loading">게시글 로딩 중...</div>;
  }

  const isOwner = user && post.author.username === user.username;

  // 파일명 디코딩
  const fileName = post.fileUrl
    ? decodeURIComponent(post.fileUrl.split('/').pop())
    : '';

  return (
    <div className="post-detail-page-wrapper">
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
          <button className="nav-btn" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </header>

      {/* 콘텐츠 영역 */}
      <main className="content-area">
        <div className="card-container">
          {/* 게시글 헤더 */}
          <div className="detail-header">
            <h2 className="detail-title">{post.title}</h2>
            <div className="detail-meta">
              <span className="meta-author">{post.author.username}</span>
              <span className="meta-separator">·</span>
              <span className="meta-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-actions">
              {/* <button
                className="action-icon print"
                onClick={() => window.print()}
                title="인쇄"
              >
                인쇄
                </button> */}
            </div>
          </div>

          <hr className="detail-divider" />

          {/* 본문 */}
          <section className="detail-body">
            {post.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>

          {/* 파일 다운로드 (파일명 표시 + download 속성) */}
          {post.fileUrl && (
            <div className="download-container">
              <a
                href={`http://localhost:5000/posts/${postId}/download`}
                className="download-btn"
                download={fileName}
              >
                {fileName}
              </a>
            </div>
          )}

          {/* 수정/삭제 버튼 (작성자 본인) */}
          {isOwner && (
            <div className="owner-btn-group">
              <button
                className="owner-btn delete-btn"
                onClick={handleDelete}
              >
                삭제하기
              </button>
              <button
                className="owner-btn edit-btn"
                onClick={handleEdit}
              >
                수정하기
              </button>
            </div>
          )}

          {/* 댓글 입력 */}
          <section className="comment-input-area">
            <form
              className="comment-form"
              onSubmit={handleCommentSubmit}
            >
              <textarea
                className="comment-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                required
              />
              <button
                className="comment-submit-btn"
                type="submit"
              >
                댓글 작성
              </button>
            </form>
          </section>

          {/* 댓글 리스트 */}
          <div className="comment-list">
            {comments.map((c) => {
              const mine = user && c.author.username === user.username;
              return (
                <div key={c._id} className="comment-item">
                  {/* 댓글 메타 (작성자 · 시간) */}
                  <div className="comment-meta">
                    <span className="comment-author">
                      {c.author.username}
                    </span>
                    <span className="comment-sep">·</span>
                    <span className="comment-date">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-content">{c.content}</p>
                  {mine && (
                    <div className="comment-owner-btns">
                      <button
                        className="comment-btn delete-comment-btn"
                        onClick={() => handleCommentDelete(c._id)}
                      >
                        삭제
                      </button>
                      <button
                        className="comment-btn edit-comment-btn"
                        onClick={() =>
                          handleCommentEdit(c._id, c.content)
                        }
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 뒤로 가기 */}
          <div className="back-btn-container">
            <button
              className="back-btn"
              onClick={() => navigate('/posts')}
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PostDetail;