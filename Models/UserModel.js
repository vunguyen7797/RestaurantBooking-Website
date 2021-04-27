"use strict";
const { db } = require("./db");
const uuidV4 = require('uuid').v4; 


class UserModel {
    constructor (db) {
        this.db = db;
    }

    createUser (user) {
        try {
            
            const sql = `
                INSERT INTO Users 
                    (userID, username, passwordHash, email, phoneNumber, address) 
                VALUES 
                    (@userID, @username, @passwordHash, @email, @phoneNumber, @address)
            `;
            const addUserStmt = db.prepare(sql);
            
            // Create the user's id and add it to the user object
            user.userID = uuidV4();
            // attempt to add them to the database
            addUserStmt.run(user);
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeEmailAddress (newEmailAddr, userID) {
        try {
            const sql = `
                UPDATE Users
                SET
                    email=@newEmail
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({
                newEmail: newEmailAddr,
                userID
            });
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    changeUsername (newUsername, userID) {
        try {
            const sql = `
                UPDATE Users
                SET
                    username=@newUsername
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({
                newUsername,
                userID
            });
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    upgradeToAdmin (userID) {
        try {
            const sql = `
                UPDATE Users
                SET
                    role = 1
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({userID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    revokeAdmin (userID) {
        try {
            const sql = `
                UPDATE Users
                SET
                    role = 0
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({userID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    emailVerified (userID) {
        try {
            const sql = `
                UPDATE Users
                SET
                    didVerifyEmail=1
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({userID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    deleteUser (userID) {
        try {
            const sql = `
                DELETE FROM Users
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).run({userID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getPasswordHash (email) {
        try {
            return db.prepare(`
                    SELECT passwordHash 
                    FROM Users 
                    WHERE email=@email
                `).get({email});
        } catch (err) {
            return;
        }
    }

    getUserDataEmail (email) {
        try {
            const sql = `
                SELECT 
                    userID, userName, passwordHash, 
                    role, email, didVerifyEmail
                FROM
                    Users
                WHERE
                email=@email
            `;
     
            return db.prepare(sql).get({email});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getUserData (userID) {
        try {
            const sql = `
                SELECT 
                    userID, userName, passwordHash, 
                    role, email, didVerifyEmail
                FROM
                    Users
                WHERE
                    userID=@userID
            `;
            db.prepare(sql).get({userID});
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getUsers () {
        try {
            const sql = `
                SELECT *
                FROM Users
            `;
            const getAllUsersStmt = db.prepare(sql);
            
            return getAllUsersStmt.all();
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return [];        // return false to indicate failure
        }
    }
}

exports.userModel = new UserModel(db);