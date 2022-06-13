const Model = require('../utils/model');
const mysql = require('mysql2');
const db = require('../utils/db');

module.exports =  class Card extends Model {
    constructor(table) {
        super(table);
    }

    async find(id) {
        const data = await super.find(id);
        this.id = data[0].id;
        this.name = data[0].name;
        this.mana = data[0].mana;
        this.damage = data[0].damage;
        this.defence = data[0].defence;
        this.picture = data[0].picture;

        return this;
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

    async getAllCards() {
        const sql = `SELECT * FROM ${this.table};`;
        const connection = db.connect();
        const data = await connection.promise().query(sql);
        connection.end();
        
        if (data[0].length) {
            return data[0];
        }
        return -1;
    }
}