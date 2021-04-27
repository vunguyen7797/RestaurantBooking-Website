"use strict";

const express = require("express");
const app = express();
const path = require("path");
const argon2 = require("argon2");
const Joi = require('joi');
const { schemas, VALIDATION_OPTIONS } = require("./validators/allValidators");
const redis = require('redis');
const session = require('express-session');
let ejs = require('ejs');
let html = ejs.render('login.html');
const PORT = 8001;


let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

redisClient.on("error", function (err) {
    console.log("Error " + err);
});

app.use(express.json());

app.use(express.static(path.join(__dirname, "public"), {
	extensions: ['html'],
}));

app.use(express.urlencoded());
 
app.use(
    session({
	store: new RedisStore({ client: redisClient }),
	secret: "somethingSecret",
	resave: false,
	saveUninitialized: false,
    name: "session",
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 8, // 8 hours
      }
    })
);

const { userModel } = require('./Models/UserModel'); 

// Create a new user account
app.post("/users", async (req, res) => {

	console.log("POST /users");

    console.log(req.body);
	const { username, password, email, phoneNumber, address } = req.body;//schemas.userSchema.validate(req.body, VALIDATION_OPTIONS);

	try {
        console.log(username);

		const passwordHash = await argon2.hash(password, { hashLength: 5 });
		const userAdded = userModel.createUser({
			username,
			passwordHash,
			email,
            phoneNumber,
            address
		});

		if (userAdded) {
            res.redirect("login.html");
		} else { // something went wrong
			res.sendStatus(500); // 500 Internal Server Error
		}
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;// schemas.loginSchema.validate(req.body, VALIDATION_OPTIONS);
    console.log(req.body);
	try {
		const row = userModel.getPasswordHash(email);
		const user = userModel.getUserDataEmail(email);
   
		if (!row) {
			return res.sendStatus(400);
		}

		const { passwordHash } = row;

		if (await argon2.verify(passwordHash, password)) {
			req.session.regenerate(function (err) {

				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
    
				req.session.userID = user.userID;
				req.session.email = user.email;
				req.session.username = user.username;
				req.session.role = user.role;
				req.session.isLoggedIn = true;
                req.session.phoneNumber = user.phoneNumber;
                req.session.address = user.address;
                req.session.didVerifyEmail = user.didVerifyEmail;
                console.log("User requested to login: " + req.session.username );
				return res.redirect('success.html');
			});
		} else {
			return res.sendStatus(401);
		}
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/logout", async (req, res) => {

	try {
		if (req.session) {
            console.log("Request to logout from: " + req.session.username);
			req.session.destroy(function (err) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
				else {
					return res.redirect('login.html');
				}
			});
		} else {
            return res.redirect('login.html');
		}

	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});



app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

