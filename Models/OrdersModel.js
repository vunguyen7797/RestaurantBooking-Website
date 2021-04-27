"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class OrdersModel {
    constructor (db) {
        this.db = db;
    }

    createMenuSet (order) {
        try{
            const sql = `
                INSERT INTO Orders
                    (orderID, customer, bookingDate, serviceType, selectedMenu)
                VALUES
                    (@orderID, @customer, @bookingDate, @serviceType, @selectedMenu)
            `;
            const createOrder = db.prepare(sql);

            menuSet.orderID = uuidV4();
            createOrder.run(order);
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeBookingDate (newBookingDate, orderID){
        try{
            const sql = `
                UPDATE Orders
                SET bookingDate = @newBookingDate
                WHERE orderID = @orderID
            `;
            db.prepare(sql).run({newBookingDate, orderID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeServiceType (newServiceType, orderID){
        try{
            const sql = `
                UPDATE Orders
                SET serviceType = @newServiceType
                WHERE orderID = @orderID
            `;
            db.prepare(sql).run({newServiceType, orderID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeSelectedMenu (newSelectedMenu, orderID){
        try{
            const sql = `
                UPDATE Orders
                SET selectedMenu = @newSelectedMenu
                WHERE orderID = @orderID
            `;
            db.prepare(sql).run({newSelectedMenu, orderID});
            return true;
        } catch(err){
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    deleteMenuSet (orderID) {
        try {
            const sql = `
                DELETE FROM Orders
                WHERE orderID=@orderID
            `;
            db.prepare(sql).run({orderID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getOrder (orderID) {
        try {
            const sql = `
                SELECT * FROM Orders
            `;
            db.prepare(sql).get({orderID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getSelectedMenu (orderID) {
        try {
            const sql = `
                SELECT orderID, selectedMenu FROM Orders
                WHERE orderID = @orderID
            `;
            db.prepare(sql).get({orderID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getServiceType (orderID) {
        try {
            const sql = `
                SELECT orderID, serviceType FROM Orders
                WHERE orderID = @orderID
            `;
            db.prepare(sql).get({orderID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getBookingDate (orderID) {
        try {
            const sql = `
                SELECT orderID, bookingDate FROM Orders
                WHERE orderID = @orderID
            `;
            db.prepare(sql).get({orderID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }
}

const ordersModel = new OrdersModel(db);
exports.ordersModel = new OrdersModel(db);