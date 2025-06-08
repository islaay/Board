// /src/components/Comment.js

import React, { useState } from 'react';
import axios from 'axios';

function Comment({
  postId,
  commentId,
  authorId,         // 부모가 넘겨준 댓글 작성자 ID
  authorName,       // (선택) 화면에 보여줄 댓글 작성자 이름
  existingContent,
  isEditMode,
  currentUserId,    // 부모가 넘겨준 현재 로그인된 유저 ID
  onCommentUpdate
}) {
  const [content, setContent] = useState(existingContent || '');
  const [isEdit, setIsEdit] = useState(isEditMode || false);

  // 로컬 스토리지에서 토큰 가져오기
  const getToken = () => localStorage.getItem('token');
  const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // “본인 여부” 체크
  const isAuthor = authorId === currentUserId;

  // 댓글 작성/수정 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthor && isEdit) {
      alert('본인 댓글만 수정할 수 있습니다.');
      return;
    }
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        alert('로그인이 필요합니다.');
        return;
      }

      if (isEdit) {
        // 1) 본인 확인은 위에서 걸렸으므로, 수정 요청
        const response = await axios.put(
          `/comments/${commentId}`,
          { content },
          { headers }
        );
        console.log('댓글 수정 성공:', response.data);
        setIsEdit(false);
        onCommentUpdate(response.data);
      } else {
        // 2) 새 댓글 작성
        const response = await axios.post(
          '/comments',
          { postId, content },
          { headers }
        );
        console.log('댓글 작성 성공:', response.data);
        onCommentUpdate(response.data);
      }
      setContent('');
    } catch (error) {
      console.error(isEdit ? '댓글 수정 실패:' : '댓글 작성 실패:', error);
    }
  };

  // 댓글 삭제 처리
  const handleDelete = async () => {
    if (!isAuthor) {
      alert('본인 댓글만 삭제할 수 있습니다.');
      return;
    }
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        alert('로그인이 필요합니다.');
        return;
      }
      await axios.delete(`/comments/${commentId}`, { headers });
      console.log('댓글 삭제 성공');
      onCommentUpdate({ deleted: true, commentId });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '8px', marginBottom: '12px' }}>
      {/* 댓글 작성자 표시 (선택) */}
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
        작성자: <strong>{authorName}</strong>
      </p>

      {isEdit ? (
        // 수정 모드 폼
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', minHeight: '60px' }}
          />
          <div style={{ marginTop: '4px' }}>
            <button type="submit">수정하기</button>
            <button
              type="button"
              onClick={() => { setIsEdit(false); setContent(existingContent); }}
              style={{ marginLeft: '8px' }}
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        // 일반 읽기 모드
        <div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>

          {/* 본인 댓글인 경우에만 수정/삭제 버튼 노출 */}
          {isAuthor && (
            <div style={{ marginTop: '6px' }}>
              <button onClick={() => setIsEdit(true)}>수정</button>
              <button
                onClick={handleDelete}
                style={{ marginLeft: '8px', color: 'red' }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Comment;