import express from 'express';
import { v4 } from 'uuid'
import { createInviteCode } from '../utils/createInviteCode.js'
const router = express.Router();

router.get('/checkInviteCode', (req, res) => {
  //todo: db에서 roomName검색 후 inviteCode 리턴
  //return inviteCode
  res.status(200).json({
    message: 'success'
  });
});

router.post('/createRoom', (req, res) => {
  const roomName = v4()
  const inviteCode = createInviteCode()
  //todo: db에 저장, 리턴 roomName
  res.status(200).json({
    message: 'success',
    roomName: roomName
  });
});


router.get('/send', (req, res, next) => {
  res.status(200).json({
    message: 'success'
  });
});


router.get('/test',(req,res,next)=>{
  console.log("test")
})

export default router;
