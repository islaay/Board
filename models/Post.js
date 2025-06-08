// models/Post.js

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // 파일 업로드한 뒤 저장될 경로(또는 URL)를 담을 필드
  fileUrl: {
    type: String,
    default: ''   // 파일이 없는 경우 빈값
  }
  // 만약 여러 개 파일을 올리려면,
  // files: [{ type: String }] 형태로 정의하면 됩니다.
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);