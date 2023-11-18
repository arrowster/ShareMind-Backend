import express from 'express';
import { v4 } from 'uuid'
import { createInviteCode } from '../utils/createInviteCode.js'
import Database from '../db/dbConnectPool.js'

const router = express.Router()
const database = new Database();

router.get('/getInviteCode', (req, res) => {
  const { roomName } = req.query;

  database.getConnection((conn) => {
    conn.query('SELECT inviteCode FROM note_room WHERE roomName = ?', [roomName], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error 방 이름 검색 중 에러발생' });
        return;
      }

      if (result.length > 0) {
        const inviteCode = result[0].inviteCode;
        res.status(200).json({ inviteCode });
      } else {
        res.status(404).json({ message: '해당 내용을 찾지 못했습니다' });
      }
    });
    conn.release();
  });
});

router.get('/getRoomName', (req, res) => {
  const { inviteCode } = req.query;

  database.getConnection((conn) => {
    conn.query('SELECT roomName FROM note_room WHERE inviteCode = ?', [inviteCode], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error 초대코드 검색 중 에러발생' });
        return;
      }

      if (result.length > 0) {
        const roomName = result[0].roomName
        res.status(200).json({ roomName });
      } else {
        res.status(404).json({ message: '해당 내용을 찾지 못했습니다' });
      }
    });
    conn.release();
  });
});

router.post('/createRoom', async (req, res) => {
  try {
    console.log('test in createRoom');
    const inviteCode = await createInviteCode();
    const roomName = v4();

    await new Promise((resolve, reject) => {
      database.getConnection((conn) => {
        conn.query('INSERT INTO note_room (inviteCode, roomName) VALUES (?, ?)', [inviteCode, roomName], (err, result) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
        conn.release();
      });
    });

    res.status(200).json({
      message: 'success',
      roomName: roomName,
      inviteCode: inviteCode
    });
  } catch (err) {
    res.status(500).json({ message: '노트 생성 실패' });
  }
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
