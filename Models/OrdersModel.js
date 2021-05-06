"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 

class OrdersModel {
    constructor (db) {
        this.db = db;
    }

    createOrder (order) {
        try{
       
            const sql = `
                INSERT INTO Orders
                    (orderID, customer, bookingDate,  selectedMenu)
                VALUES
                    (@orderID, @userID, @date,  @selectedMenu)
            `;
            const prepCreateOrder = db.prepare(sql);
          
            order.orderID = uuidV4();
            console.log(order);
            prepCreateOrder.run(order);
            return order.orderID;
        } catch(err){
            console.error(err);  // then log it
            return {};        // return false to indicate failure
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

    deleteOrder (orderID) {
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
                WHERE orderID = @orderID
            `;
            return db.prepare(sql).get({orderID});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return empty object to indicate failure
        }
    }

    getAllOrder () {
        try {
            const sql = `
                SELECT * FROM Orders
            `;
            return db.prepare(sql).get({orderID});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return false to indicate failure
        }
    }

    getSelectedMenu (orderID) {
        try {
            const sql = `
                SELECT orderID, selectedMenu FROM Orders
                WHERE orderID = @orderID
            `;
            return db.prepare(sql).get({orderID});
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
            return db.prepare(sql).get({orderID});
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
            return db.prepare(sql).get({orderID});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }
}

const ordersModel = new OrdersModel(db);
exports.ordersModel = new OrdersModel(db);