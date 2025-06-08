// /Board/server.js

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const cors = require('cors');  // CORS 미들웨어 불러오기
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const socket = new WebSocket('ws://localhost:5000/ws');

const app = express();

// CORS 미들웨어 적용
const corsOptions = {
  origin: 'http://localhost:3000',  // React 앱이 실행 중인 출처만 허용
};
app.use(cors(corsOptions));

// JSON 형식으로 요청 본문을 받기 위해 body-parser 사용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/// multer 설정정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // “uploads” 폴더에 저장
    const uploadDir = path.join(__dirname, 'uploads');
    // 만약 “uploads” 폴더가 없다면 먼저 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ★ file.originalname(원래 파일명)을 latin1→UTF-8로 디코딩
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(decodedName); // 확장자 (.png, .pdf 등)
    const baseName = path.basename(decodedName, ext).replace(/\s+/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// 파일 업로드 API
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 최대 20MB
  fileFilter: (req, file, cb) => {
    // 업로드된 originalname도 latin1→UTF-8로 디코딩 후 검사
    const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const extName = allowedExt.test(path.extname(decodedName).toLowerCase());
    const mimeType = allowedMime.includes(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error('업로드 가능한 파일: 이미지, PDF, DOC/DOCX, TXT만 가능합니다.'));
    }
  }
});

// 허용할 확장자 및 MIME 타입 (이미지, PDF, DOC/DOCX, TXT 등)
const allowedExt = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
const allowedMime = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain'
];

/** ─── 3) JWT 검증 미들웨어 ─── **/
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다. 로그인 해주세요.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded; // decoded.userId가 있다고 가정
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다. 다시 로그인 해주세요.' });
    }
    return res.status(401).json({ message: '잘못된 토큰입니다. 다시 로그인 해주세요.' });
  }
};

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.log('MongoDB 연결 실패:', err));

// 서버 기본 설정
app.get('/', (req, res) => {
  res.send('게시판 서버가 시작되었습니다!');
});

// 메인 페이지 로그인된 사용자 정보 제공 API
app.get('/user', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다. 로그인 해주세요.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId);  // 사용자 정보 찾기

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
    });  // 사용자 정보 반환
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    res.status(401).json({ message: '잘못된 토큰입니다. 다시 로그인 해주세요.' });
  }
});

// 파일 다운로드 API
app.get('/posts/:postId/download', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post || !post.fileUrl) {
      return res.status(404).json({ message: '파일이 없습니다.' });
    }

    // fileUrl 예시: "/uploads/원본파일명-...png"
    // basename으로 실제 파일명만 꺼냅니다.
    const fileName = path.basename(post.fileUrl);
    const filePath = path.join(__dirname, 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
    }

    // res.download은 내부적으로 Content-Disposition: attachment 헤더를 설정합니다.
    return res.download(filePath, fileName);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// 게시글 전체 조회 API
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username');  // 'author'를 기준으로 'username'만 가져옵니다
    res.json(posts);  // 게시글 목록 반환
  } catch (err) {
    console.error('게시글 조회 실패:', err);
    res.status(500).json({ message: '게시글 조회 실패', error: err });
  }
});

// 게시글 상세 조회 API
app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;  // URL에서 게시글 ID를 추출

  try {
    const post = await Post.findById(postId).populate('author', 'username');  // 'author'를 기준으로 'username'만 가져옵니다
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);  // 게시글 반환
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '게시글 조회 실패', error: err });
  }
});

// 게시글 작성 API
app.post('/posts', authMiddleware, upload.single('file'), async (req, res) => {
  const { title, content } = req.body;
  try {
    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }
    const post = new Post({ title, content, author: req.user.userId, fileUrl });
    await post.save();
    console.log('Saved post.fileUrl =', post.fileUrl); // ← 여기에서 파일 경로가 제대로 찍히는지
    res.status(201).json(post);
  } catch (error) {
    console.error('게시글 등록 실패:', error);
    res.status(500).json({ message: '게시글 등록 실패', error });
  }
});


/** 게시글 수정 (파일 변경 가능) **/
app.put('/posts/:postId', authMiddleware, upload.single('file'), async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    // 작성자 검증
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: '본인 게시글만 수정할 수 있습니다.' });
    }

    // 타이틀/콘텐츠 업데이트
    post.title = title;
    post.content = content;

        if (req.body.removeFile === 'true') {
      post.fileUrl = '';
    }
    if (req.file) {
      post.fileUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await post.save();
    res.json(updated);
  } catch (error) {
    console.error('게시글 수정 실패:', error);
    res.status(500).json({ message: '게시글 수정 실패', error });
  }
});

/** 게시글 삭제 **/
app.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    // 작성자 검증
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: '본인 게시글만 삭제할 수 있습니다.' });
    }

    // (선택) 업로드했던 파일도 실제로 삭제하려면 fs.unlink 사용
    // 예시:
    // if (post.fileUrl) {
    //   const filePath = path.join(__dirname, post.fileUrl);
    //   fs.unlink(filePath, (err) => {
    //     if (err) console.error('파일 삭제 실패:', err);
    //   });
    // }

    await Post.findByIdAndDelete(postId);
    res.json({ message: '게시글 삭제 성공' });
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    res.status(500).json({ message: '게시글 삭제 실패', error });
  }
});

// 회원가입 API (POST 요청 처리)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이메일이 이미 존재합니다.' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: '회원가입 성공', user: newUser });
  } catch (error) {
    console.error('회원가입 실패:', error);
    res.status(500).json({ message: '회원가입 실패', error });
  }
});

// // 사용자 추가 API
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;  // 사용자 정보 받기
  const user = new User({ username, email, password });  // 새 사용자 만들기
  await user.save();  // MongoDB에 저장
  res.json(user);  // 저장된 사용자 정보 반환
});


// 로그인 API (POST 요청 처리) - 비밀번호 암호화 없이 평문으로 확인
app.post('/login', async (req, res) => {
  const { email, password } = req.body;  // 요청 본문에서 이메일과 비밀번호를 받음

  try {
    // 이메일로 사용자 찾기
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 평문 비밀번호 비교
    if (password !== user.password) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // JWT 토큰 발급
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });  // secret 키와 만료시간 설정

    // 로그인 성공 시, 응답
    res.status(200).json({ message: '로그인 성공', token, user });

  } catch (error) {
    console.error('로그인 실패:', error);
    res.status(500).json({ message: '로그인 실패', error });
  }
});

// 댓글 추가 API
app.post('/comments', authMiddleware, async (req, res) => {
  const { postId, content } = req.body;

  try {
    const comment = new Comment({
      postId,
      content,
      author: req.user.userId   // 로그인된 사용자 ID를 author로 저장
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('댓글 생성 실패:', err);
    res.status(400).json({ message: '댓글 생성 실패', error: err });
  }
});


// 댓글 조회 API (게시글에 해당하는 댓글 조회)
app.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;  // URL에서 게시글 ID를 추출

  try {
    // 댓글 목록을 가져오고, author 필드를 username과 함께 populate하여 사용자 정보를 포함
    const comments = await Comment.find({ postId })
      .populate('author', 'username');  // 'username'만 반환하도록 수정
    res.json(comments);  // 댓글 목록 반환
  } catch (err) {
    console.error('댓글 조회 실패:', err);
    res.status(500).json({ message: '댓글 조회 실패', error: err });
  }
});

// // 댓글 수정 API
app.put('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    // 1) DB에서 댓글을 찾는다
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 2) 요청 유저와 댓글 작성자를 비교
    // comment.author는 ObjectId 타입 (ex: "64a3c9f1..."), req.user.userId도 마찬가지
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: '본인 댓글만 수정할 수 있습니다.' });
    }

    // 3) 같으면 실제로 수정
    comment.content = content;
    const updated = await comment.save();
    return res.json(updated);

  } catch (error) {
    console.error('댓글 수정 실패:', error);
    return res.status(400).json({ message: '댓글 수정 실패', error });
  }
});

// 댓글 삭제 API
app.delete('/comments/:commentId', authMiddleware, async (req, res) => {
  const { commentId } = req.params;

  try {
    // 1) DB에서 댓글을 찾는다
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 2) 작성자 확인
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: '본인 댓글만 삭제할 수 있습니다.' });
    }

    // 3) 같으면 삭제
    await Comment.findByIdAndDelete(commentId);
    return res.json({ message: '댓글 삭제 성공' });
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    return res.status(400).json({ message: '댓글 삭제 실패', error });
  }
});

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중...`);
});