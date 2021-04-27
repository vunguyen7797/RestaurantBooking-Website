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
app.set('view engine', 'ejs');
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
const { menuCategoryModel } = require('./Models/MenuCategoryModel');
const { dishesModel } = require('./Models/DishesModel'); 
const { menuContentModel } = require('./Models/MenuContentModel'); 
const { menuSetsModel } = require('./Models/MenuSetsModel'); 
const { ordersModel } = require('./Models/OrdersModel'); 

// Create a new user account
app.post("/users", async (req, res) => {
	console.log("POST /users");
	const { value, error } = schemas.userSchema.validate(req.body, VALIDATION_OPTIONS);
	if (error) {
		return res.sendStatus(400);
	}
	else {
		const { username, password, email, phoneNumber, address } = value;

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
	}

});

app.post("/login", async (req, res) => {

	if (!req.session.loginAttempts){
		req.session.loginAttempts = 1;
		console.log("This is the user's first visit for the session.");
	}
	else if (req.session.loginRetry == true)
	{
		return res.sendStatus(429);
	} else
	{
	  req.session.loginAttempts++;
	  console.log(`This is the user's has tried to login ${req.session.loginAttempts} times.`);
	}

	if (req.session.loginAttempts == 2 && req.session.loginRetry == false)
	{
		req.session.loginRetry = true;
		setTimeout(()=>{
			req.session.loginRetry = false;
			console.log('Request send while waiting ' + req.session.loginRetry);
		}, 30000);
	}
		
		//res.sendStatus(429);

	console.log('Done checking');




	const { value, error } = schemas.loginSchema.validate(req.body, VALIDATION_OPTIONS);
	console.log("POST /login");
	if (error) {
		return res.sendStatus(400);
	}
	else {
		const { email, password } = value;
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
					console.log("User requested to login: " + req.session.username);
					return res.redirect('success.html');
				});
			} else {
				return res.sendStatus(401);
			}
		} catch (err) {
			console.error(err);
			return res.sendStatus(500);
		}

	}

});

app.post("/logout", async (req, res) => {
	console.log("POST /logout");
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

app.get("/login", (req, res)=>{

	console.log("GET /login");
	res.render("login");
} );

// Display the categories on the home pages
app.get("/", (req, res)=>{

	console.log("GET /categories");
	const categories = menuCategoryModel.getMenuCategories();
	console.log(categories.length);
	if (categories.length > 0) {
		console.log("Render home page");
		res.render("homePage", { categories });
	} else {
		res.sendStatus(404);
	}
} );

// Display the menu sets in a category
app.get("/categories/:catID", (req, res)=>{

	console.log("GET /categories" + req.params.catID);

	const catName = menuCategoryModel.getCategoryName(req.params.catID);
	console.log(catName);
	const menuSets = menuSetsModel.getAllMenuSet(req.params.catID);
	let menuContents = [];
	if (menuSets.length > 0){
		console.log(menuSets)
		for (let i = 0; i < menuSets.length; i++){
		
			let dishData = dishesModel.getAllDishesByMenu(menuSets[i]['menuID']);
			menuContents.push({key: menuSets[i]['menuID'], value: dishData});
		}
		console.log(menuContents[0].value);
		console.log(menuContents.length);
		res.render("categoryMenuSets", {catName, menuSets, menuContents});
	}
	else {
		res.sendStatus(404);
	}



	// const categories = menuCategoryModel.getMenuCategories();
	// console.log(categories.length);
	// if (categories.length > 0) {
	// 	console.log("Render home page");
	// 	res.render("homePage", { categories });
	// } else {
	// 	res.sendStatus(404);
	// }


} );

app.get("/list-products", (req, res)=>{

	console.log("GET /list-products")
	const allDishes = dishesModel.getDishes();
	if (allDishes.length > 0){
		res.render("listProducts", {allDishes} );
	}
	else {
		res.sendStatus(404);	
	}
} );

app.get("/contact", (req, res)=>{

	console.log("GET /contact")
	res.render("contact", {});
} );

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

