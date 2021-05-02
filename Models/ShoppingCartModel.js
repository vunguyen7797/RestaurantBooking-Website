"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class ShoppingCartModel {
    constructor (db) {
        this.db = db;
    }

    createMenuSet (menuSet) {
        try{
            const sql = `
                INSERT INTO MenuSets
                    (menuID, name, numberDishes, price)
                VALUES
                    (@menuID, @name, @numberDishes, @price)
            `;
            const createMenuSet = db.prepare(sql);

            menuSet.menuID = uuidV4();
            createMenuSet.run(menuSet);
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    
}

exports.shoppingCartModel = new ShoppingCartModel(db);