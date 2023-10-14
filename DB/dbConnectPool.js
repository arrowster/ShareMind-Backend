import mysql from 'mysql2'
let instance = null;
import dotenv from 'dotenv'
dotenv.config()

class Database {
    constructor(){
        if(instance) return instance;
        instance = this;
        this.pool = mysql.createPool(
            {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_SCHEMA,
            }
        )
    }
    getConnection(callback) {
        this.pool.getConnection(function (err, conn) {
            if(!err) {
                callback(conn);
            } else {
                // TODO: 에러 발생시 err 처리하고 그냥 박는게 말이 됨?
                console.error('DB connection err');
                console.error(err);
                throw err;
            }
        });
    }
}

export default Database;