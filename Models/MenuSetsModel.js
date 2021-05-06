"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class MenuSetsModel {
    constructor (db) {
        this.db = db;
    }

    createMenuSet (menuSet) {
        try{
            const sql = `
                INSERT INTO MenuSets
                    (menuID, name, numberDishes, price, category)
                VALUES
                    (@menuID, @name, @numberDishes, @price, @categories)
            `;
         
            const createMenuSet = db.prepare(sql);
            createMenuSet.run(menuSet);
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changePrice (newPrice, menuID){
        try{
            const sql = `
                UPDATE MenuSets
                SET price = @newPrice
                WHERE menuID = @menuID
            `;
            db.prepare(sql).run({newPrice, menuID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeNumberDishes (newNumberDishes, menuID){
        try{
            const sql = `
                UPDATE MenuSets
                SET numberDishes = @newNumberDishes
                WHERE menuID = @menuID
            `;
            db.prepare(sql).run({newNumberDishes, menuID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeName (newName, menuID){
        try{
            const sql = `
                UPDATE MenuSets
                SET name = @newName
                WHERE menuID = @menuID
            `;
            db.prepare(sql).run({newName, menuID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    deleteMenuSet (menuID) {
        try {
            const sql = `
                DELETE FROM MenuSets
                WHERE menuID=@menuID
            `;
            db.prepare(sql).run({menuID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    updateMenuSetByID (menuSet) {
        try {
            const sql = `
                UPDATE MenuSets
                SET name = @name, price = @price, category = @categories
                WHERE menuID = @menuID
            `;
            db.prepare(sql).run(menuSet);
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;
        }
    }

    getAllMenuSet (catId) {
        try {
            const sql = `
                SELECT * FROM MenuSets WHERE category  = @catId;
            `;
            let result =  db.prepare(sql).all({catId});
            console.log(result);
            return result;
        } catch (err) {    // if there was any error
            console.error(err);  // then log it
            return [];        // return false to indicate failure
        }
    }

    getMenuSetById(menuID){
        try {
            const sql = `
                SELECT * FROM MenuSets WHERE menuID  = @menuID
            `;
           
            return db.prepare(sql).get({menuID});;
        } catch (err) {    // if there was any error
            console.error(err);  // then log it
            return {} ;        // return false to indicate failure
        }
    }

    getMenuSets () {
        try {
            const sql = `
                SELECT * FROM MenuSets
            `;
            
            return db.prepare(sql).all({});;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return false to indicate failure
        }
    }



    getMenuSetPrice (menuID) {
        try {
            const sql = `
                SELECT name, price FROM MenuSet
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

exports.menuSetsModel = new MenuSetsModel(db);