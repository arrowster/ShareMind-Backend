import express from 'express'
import utils from '../utils/utils.js'
import emailConfig from "../utils/emailConfig.js";
import getCurrentDatetime from "../utils/getCurrentDatetime.js";
import moment from 'moment'
import bcrypt from 'bcryptjs'
import { v4 } from 'uuid'
import Database from '../db/dbConnectPool.js'

const router = express.Router()
const database = new Database()

router.post('/checkEmail', async function(req, res, next) {
  const emailAddr = req.body.sendEmail
  console.log("이메일: " + emailAddr)

  try {
    const result = await emailConfig.sendEmail(emailAddr);
    if (result.success) {
      console.log('이메일 전송 성공');
      const authNum = result.number;
      const sendDateTime = getCurrentDatetime.getCurrentDateTime();
      database.getConnection((conn) => {
        conn.query(`INSERT INTO email_auth (email, verification_code, send_time) 
                    VALUES ("${emailAddr}","${authNum}","${sendDateTime}")`, (err) => {
          if (err) throw err;
        })
        res.json({
          message: '이메일 전송 성공'
        })
      });
    } else {
      console.log('이메일 전송 실패');
      console.log(result.error)
      res.json({
        message: '이메일 전송 실패'
      });
    }
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).json({
      message: '서버 오류 발생'
    });
  }
});
router.get('/checkAuth', (req, res) => {
  const emailConfirmCode = req.query.code;
  const email = req.query.email;

  database.getConnection((conn) => {
    conn.query(`SELECT * FROM email_auth WHERE email = ? AND verification_code = ? ORDER BY send_time DESC LIMIT 1`, [email, emailConfirmCode], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
      } else {
        if (results.length === 1) {
          // 데이터를 찾은 경우, 검증 성공
          res.status(200).json({ success: true, message: '이메일 인증 성공' });
        } else {
          // 데이터를 찾지 못한 경우, 검증 실패
          res.status(400).json({ success: false, message: '이메일 인증 실패' });
        }
      }
    });
    conn.release();
  });
});

router.post('/signUp', (req, res) => {
  const user = {
    'id': req.body.id,
    'password': req.body.password
  }
  const uuid = v4()
  database.getConnection((conn) => {
    conn.query(`SELECT id FROM users WHERE id = "${user.id}"`, (err, row) => {
      if (!row || typeof row[0] === 'undefined') { // 동일한 아이디가 없을경우,
        const salt = bcrypt.genSaltSync();
        const encryptedPassword = bcrypt.hashSync(user.password, salt);
        conn.query(`INSERT INTO users (\`index\`, id, password) VALUES (?, ?, ?)`, [uuid, user.id, encryptedPassword], (err) => {
          if (err) throw err;
        })
        res.json({
          success: true,
          message: 'Sing Up Success!'
        })
      } else {
        res.json({
          success: false,
          message: 'Sign Up Failed Please use another ID'
        })
      }
    })
    conn.release();
  })
})

router.post('/login', function (req, res) {
  const user = {
    'id': req.body.id,
    'password': req.body.password
  };

  database.getConnection((conn) => {
    conn.query(`SELECT id, password FROM users WHERE id = "${user.id}"`, (err, row) => {
      if (err) {
        return res.json({ // 매칭되는 아이디 없을 경우
          success: false,
          message: '로그인 실패 이메일이나 패스워드를 확인해보세요'
        })
      }
      if (row && typeof row[0] !== 'undefined' && row[0].id === user.id) {
        bcrypt.compare(user.password, row[0].password, (err, success) => {
          const dbResponse = row[0]
          const refreshExpiry = moment().utc().add(3, 'days').endOf('day').format('X')/*todo: token 3일 추후 변경 요망*/
          console.log(refreshExpiry)
          const token = utils.generateJWT({ exp: parseInt(refreshExpiry), data: dbResponse.id })
          //https://blog.logrocket.com/how-to-implement-jwt-authentication-vue-nodejs/ 참조.

          if (success) {
          return res.json({ // 로그인 성공
              success: true,
              message: 'Login successful!',
              token: token,
            })
          } else {
            return res.json({ // 매칭되는 아이디는 있으나, 비밀번호가 틀린 경우
              success: false,
              message: 'Login failed please check your password!'
            })
          }
        })
      } else {
        return res.json({
          success: false,
          message: 'Login failed please check your id or password!(unknow)'
        })
      }
    })
    conn.release();
  });
});

router.get('/token-verify', function (req, res) {
  let token = req.headers['x-access-token'] || req.headers.authorization || req.body.token
  if (!token) {
    res.statusCode = 401
    return res.json({
      success: false
    })
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
    if (!token || token === '') {
      res.statusCode = 401
      return res.json({
        success: false
      })
    }
  }
  try {
    const decoded = utils.verifyJWT(token)
    if (!decoded) {
      res.statusCode = 401
      return res.json({
        success: false
      })
    }
    if (decoded) res.id = decoded
    res.token = token
    res.statusCode = 200
    return res.json({
      success: true
    })
  } catch (e) {
    res.statusCode = 401
    return res.json({
      success: false
    })
  }
})

export default router;
