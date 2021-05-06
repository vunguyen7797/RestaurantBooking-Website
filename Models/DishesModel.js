"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class DishesModel {
    constructor (db) {
        this.db = db;
    }

    createDish (dish) {
        try{
            const sql = `
                INSERT INTO Dishes
                    (dishID, name, description, price, dishType, photoUrl)
                VALUES
                    (@dishID, @name, @description, @price, @dishType, @photoUrl)
            `;
            const createDish = db.prepare(sql);
         
            createDish.run(dish);
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changePrice (newPrice, dishID){
        try{
            const sql = `
                UPDATE Dishes
                SET price = @newPrice
                WHERE dishID = @dishID
            `;
            db.prepare(sql).run({newPrice, dishID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeDescription (newDishDescription, dishID){
        try{
            const sql = `
                UPDATE Dishes
                SET description = @newDishDescription
                WHERE dishID = @dishID
            `;
            db.prepare(sql).run({newDishDescription, dishID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changePhotoURL (newPhotoURL, dishID){
        try{
            const sql = `
                UPDATE Dishes
                SET description = @newPhotoURL
                WHERE dishID = @dishID
            `;
            db.prepare(sql).run({newPhotoURL, dishID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    deleteDish (dishID) {
        try {
            console.log(dishID);
            const sql = `
                DELETE FROM Dishes
                WHERE dishID=@dishID
            `;
            db.prepare(sql).run({dishID});

            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    updateDishByID (dish) {
        try {
            const sql = `
                UPDATE Dishes
                SET name = @name, description = @description, price = @price, dishType = @dishType, photoUrl = @photoUrl
                WHERE dishID = @dishID
            `;
            db.prepare(sql).run(dish);
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;
        }
    }

    getDishByID (dishID) {
        try {
            const sql = `
                SELECT * FROM Dishes
                WHERE dishID=@dishID
            `;
            return db.prepare(sql).get({dishID});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return {};
        }
    }

    getDishes () {
        try {
            const sql = `
                SELECT * FROM Dishes
            `;
            const getAllDishes = db.prepare(sql);
            return getAllDishes.all();
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return false to indicate failure
        }
    }

    getAllDishesByMenu(menuID){
        try {
            const sql = `
            select * from dishes where dishID in (select dish from MenuContent where menuId = @menuID);
            `;
            return db.prepare(sql).all({menuID});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return an empty array
        }

    }

    getDishesByPrice (maxPrice, minPrice=0) {
        try {
            const sql = `
                SELECT * FROM Dishes
                WHERE price >= @minPrice AND price <= @maxPrice
            `;
            return db.prepare(sql).get({minPrice, maxPrice});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return an empty array
        }
    }

    getDishesByDishType (dishType) {
        try {
            const sql = `
                SELECT * FROM Dishes
                WHERE dishType === @dishType
            `;
            return db.prepare(sql).get({dishType});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return an empty array
        }
    }
}


exports.dishesModel = new DishesModel(db);