// /src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostList from './components/PostList';
import Main from './components/Main';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Signup from './components/Signup';
import PostEdit from './components/PostEdit';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
      <div>
        {/* <h1>게시판</h1> */}
        <Routes>
          {/* 각 페이지를 URL 경로에 맞게 설정 */}
          <Route path="/" element={<Main />} /> {/* 대표 메인페이지 */}
          <Route path="/postlist" element={<PostList />} /> {/* 게시글 목록 페이지 */}
          <Route path="/login" element={<Login />} /> {/* 로그인 페이지 */}
          <Route path="/signup" element={<Signup />} /> {/* 회원가입 페이지 */}
          <Route path="/posts" element={<PostList />} /> {/* 게시글 목록 */}
          <Route path="/posts/:postId" element={<PostDetail />} /> {/* 게시글 상세보기 */}
          <Route path="/create-post" element={<CreatePost />} /> {/* 게시글 작성 */}
           <Route path="/posts/edit/:postId" element={<PostEdit />} /> {/* 게시글 수정 */}
        </Routes>
      </div>
  );
}

export default App;