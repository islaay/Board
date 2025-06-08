// models/User.js

const mongoose = require('mongoose');

// 사용자 모델 정의
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },  // 사용자 이름
  email: { type: String, required: true, unique: true },  // 이메일 (중복 안됨)
  password: { type: String, required: true },  // 비밀번호
});

const User = mongoose.model('User', userSchema);  // User 모델 생성
module.exports = User;