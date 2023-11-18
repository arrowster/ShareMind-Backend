import Database from "../DB/dbConnectPool.js";

const database = new Database();

function generateRandomCode() {
  const characters = '0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

function isCodeDuplicate(code) {
  return new Promise((resolve, reject) => {
    database.getConnection((conn) => {
      conn.query(`SELECT * FROM note_room WHERE inviteCode = ${code}`, (err, rows) => {
        if (err) {
          reject(err);
        }
        if (rows.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  });
}

async function generateCodeAndCheckDuplicate() {
  while (true) {
    const inviteCode = generateRandomCode();
    const isDuplicate = await isCodeDuplicate(inviteCode);
    if (!isDuplicate) {
      return inviteCode;
    }
  }
}

export async function createInviteCode() {
  try {
    const inviteCode = await generateCodeAndCheckDuplicate();
    return inviteCode;
  } catch (err) {
    throw err;
  }
}