"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class MenuContentModel {
    constructor (db) {
        this.db = db;
    }

    createMenuSet (menuContent) {
        try{
            const sql = `
                INSERT INTO MenuContent
                    (menuID, dish)
                VALUES
                    (@menuID, @dish)
            `;
            const createMenuContent = db.prepare(sql);

            menuContent.menuID = uuidV4();
            createMenuContent.run(menuSet);
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeDish (newDish, menuID){
        try{
            const sql = `
                UPDATE MenuContent
                SET dish = @newDish
                WHERE menuID = @menuID
            `;
            db.prepare(sql).run({newDish, menuID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    deleteMenuContent (menuID) {
        try {
            const sql = `
                DELETE FROM MenuContent
                WHERE menuID=@menuID
            `;
            db.prepare(sql).run({menuID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getMenuContent (menuID) {
        try {
            const sql = `
                SELECT * FROM MenuContent
            `;
            db.prepare(sql).get({menuID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getMenuContentDish (menuID) {
        try {
            const sql = `
                SELECT dish FROM MenuContent
                WHERE menuID = @menuID
            `;
            db.prepare(sql).get({menuID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }
}

const menuContentModel = new MenuContentModel(db);
exports.menuContentModel = new MenuContentModel(db);