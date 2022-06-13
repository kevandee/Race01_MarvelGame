const Model = require('../utils/model');
const mysql = require('mysql2');
const db = require('../utils/db');

module.exports =  class User extends Model {
    constructor(table) {
        super(table);
    }

    async find(id) {
        const data = await super.find(id);
        this.id = data[0].id;
        this.login = data[0].login;
        this.password = data[0].password;
        this.username = data[0].username;
        this.email = data[0].email;
        this.role = data[0].role;
        return this;
    }

    async check(obj) {
        const sql = 'SELECT * FROM ' + this.table + ' WHERE login=\''+ obj.login + '\' AND password=\'' + obj.password +'\';';
        const connection = db.connect();
        let data = await connection.promise().query(sql);
        if (data[0].length) {
            return data[0][0].id;
        }
        return -1;
    }

    async delete(id) {
        const res = await super.delete(id);
        if(res) {
            this.id = 0;
            this.login = undefined;
            this.password = undefined;
            this.full_name = undefined;
            this.email = undefined;
            return true;
        }
        else {
            return false;
        }
    }

    async save(obj) {
        let res = await super.save(obj);
        if (typeof res === 'string') {
            return res.slice(6);
        }
        if (obj.id) {
            res = await this.find(obj.id);
        }
        else {
            await this.find(res);
        }

        return res;
    }

    async getByLogin(login) {
        const sql = 'SELECT * FROM ' + this.table + ' WHERE login=\'' + login + '\';';
        const connection = db.connect();
        const data = await connection.promise().query(sql);
        connection.end();
        
        if (data[0].length) {
            return data[0][0];
        }
        return -1;
    }

    async getByObj(obj) {
        const arr = Object.entries(obj);
        const sql = `SELECT * FROM ${this.table} WHERE ${arr[0][0]}=\'${arr[0][1]}\';`;
        const connection = db.connect();
        const data = await connection.promise().query(sql);
        connection.end();
        
        if (data[0].length) {
            return data[0][0];
        }
        return -1;
    }
}