"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class MenuCategoryModel {
    constructor (db) {
        this.db = db;
    }

    getMenuCategories() {
        try {
            const sql = `
                SELECT * 
                FROM MenuCategories;
            `;
            return db.prepare(sql).all();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    getCategoryName(catId) {
        try {
            const sql = `
                SELECT name 
                FROM MenuCategories WHERE catId = @catId;
            `;
            let result = db.prepare(sql).get({catId});
            return result;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

exports.menuCategoryModel = new MenuCategoryModel(db);