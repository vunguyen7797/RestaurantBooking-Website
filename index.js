"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const argon2 = require("argon2");
const Joi = require('joi');
const { schemas, VALIDATION_OPTIONS } = require("./validators/allValidators");
const redis = require('redis');
const session = require('express-session');
let ejs = require('ejs');
const shoppingCart = [];		//Shopping cart variable
const PORT = 8001;
const uuidV4 = require('uuid').v4; 
const nodemailer = require("nodemailer");

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

const transporter = nodemailer.createTransport({
    service: "Gmail",

    auth: {
		
		user: process.env.EMAIL_ADDRESS,
		pass:process.env.EMAIL_PASSWORD
    }
});

/* Return's true if the email sent succesfully and false otherwise */
async function sendEmail (recipient, subject, text, html) {
	const message = {
	  from: process.env.EMAIL_ADDRESS,
	  to: recipient,
	  subject: subject,
	  text: text,
	  html: html
	};
	
	try {
	  await transporter.sendMail(message);
	  return true;
	} catch (err) {
	  console.error(err);
	  return false;
	}
}


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
					if (req.session.role === 0)
						return res.redirect('admin-dishes');
					return res.redirect('/');
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

// User logout
app.get("/logout", async (req, res) => {
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
					return res.redirect('/login');
				}
			});
		} else {
			return res.redirect('/login');
		}

	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

// Render the login page
app.get("/login", (req, res)=>{
	if (req.session.isLoggedIn)
	{
		console.log("Already logged in");
		if (req.session.role === 0)
			return res.redirect('admin-dishes');
		return res.redirect('/');
	}
	console.log("GET /login");
	res.render("login");
} );

// Check if user is login or not and retrieve userID
app.get("/user", (req, res)=>{
	if (!req.session.isLoggedIn)
	{
		console.log("GET /user");
		res.sendStatus(404);
		
	}
	console.log("Already logged in---");

	return res.send(req.session.userID);

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

// Get dishes in admin mode
app.get("/admin-dishes", (req, res)=>{

	console.log("GET /admin-dishes")

	if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.redirect("/login"); // Forbidden
	}

	const allDishes = dishesModel.getDishes();
	if (allDishes.length > 0){
		res.render("adminDishes", {allDishes} );
	}
	else {
		res.sendStatus(404);	
}


} );

// Get menuset managers
app.get("/admin-menuset/cat", (req, res)=>{

	console.log("GET /admin-menuset?categories");
	if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.redirect('/login'); // Forbidden 
    }

	const categories = menuCategoryModel.getMenuCategories();
	const dishes = dishesModel.getDishes();
	let catName = "";
	let menuSets = [];
	let menuContents = [];

	if (req.query.categories === '0')
	{
		res.render("adminMenuSet", {catName, menuSets, menuContents, categories, dishes});
	}
	else {
		catName = menuCategoryModel.getCategoryName(req.query.categories);
		console.log(catName);
		menuSets = menuSetsModel.getAllMenuSet(req.query.categories);
	
		
		if (menuSets.length > 0){
			console.log(menuSets)
			for (let i = 0; i < menuSets.length; i++){
			
				let dishData = dishesModel.getAllDishesByMenu(menuSets[i]['menuID']);
				menuContents.push({key: menuSets[i]['menuID'], value: dishData});
			}
			console.log(menuContents[0].value);
			console.log(menuContents.length);
			res.render("adminMenuSet", {catName, menuSets, menuContents, categories, dishes});
		}
		else {
			res.redirect("/admin-menuset/cat?categories=0");
		}
	}
} );

// render add menuset page
app.get("/add-menuset", (req, res)=>{

	console.log("GET /add-menuset");
		if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.redirect('/login'); // Forbidden 
    }
	const categories = menuCategoryModel.getMenuCategories();
	const dishes = dishesModel.getDishes();
	res.render("addingMenuSet", {categories, dishes});
} );

// create a new menu set
app.post("/add-menuset", (req, res)=>{

	console.log("POST /add-menuset");
	if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
		return res.redirect('/login'); // Forbidden 
	}

	console.log(req.body);

	let menuID = uuidV4();

	let {name, price, dish1, dish2, dish3, dish4, dish5, categories} = req.body;
	let selectedDishes = [dish1, dish2, dish3, dish4, dish5];
    price = parseFloat(price);
	const numberDishes = 5;
    const didCreateMenuSet = menuSetsModel.createMenuSet({
		menuID,
        name, numberDishes, price, categories
    });

    if (didCreateMenuSet) {

		for (let i =0 ;i < 5; i++)
		{
			let dish = selectedDishes[i];
			menuContentModel.addMenuContent({
				menuID,
				dish
			});

		}
		res.redirect(`/admin-menuset/cat?categories=${categories}`);
    } else {
        res.sendStatus(500);
    }
} );

// delete a menu set
app.delete("/menuset/:menuID", (req, res) => {
	console.log("DELETE /menuset");

    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	const menuID = req.params.menuID;

    const didDeleteMenu = menuSetsModel.deleteMenuSet(
		menuID
    );

    if (didDeleteMenu) {
		
		console.log('Delete menu successfully');
		res.sendStatus(200);
   
    } else {
        res.sendStatus(500);
    }
});

// get a menu set
app.get("/menuset/:menuID", (req, res) => {
	console.log("GET /menuset");

    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	const menuID = req.params.menuID;

    const menuSet = menuSetsModel.getMenuSetById(
		menuID
    );

    if (menuSet) {
		console.log(menuSet);
		res.json(menuSet);
    } else {
        res.sendStatus(404);
    }
});

// get a menu set
app.get("/menuset/content/:menuID", (req, res) => {
	console.log("GET /menuset/content");

    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	const menuID = req.params.menuID;

    const menuContent = dishesModel.getAllDishesByMenu(menuID);

    if (menuContent) {
		console.log(menuContent);
		res.json(menuContent);
    } else {
        res.sendStatus(404);
    }
});

// Update menuset information
app.post("/menuset/:menuID", (req, res) => {
    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	const menuID = req.params.menuID;

	let { name, price, categories, dish1, dish2, dish3, dish4, dish5  } = req.body;
	let dishes = [dish1, dish2, dish3, dish4, dish5];
	console.log(dishes);
    price = parseFloat(price);

    const didUpdateMenuSet = menuSetsModel.updateMenuSetByID({
		menuID,
        name, price, categories
    });

	const didUpdateMenuContent = menuContentModel.updateMenuContentByID(menuID, dishes);

    if (didUpdateMenuSet && didUpdateMenuContent) {
        res.redirect(`/admin-menuset/cat?categories=${categories}`);
    } else {
        res.sendStatus(500);
    }
});

// display add new dish page
app.get("/add-dish", (req, res)=>{

	console.log("GET /add-dish");
	res.render("addingDish", {});
} );

// Get a specific dish
app.get("/dishes/:dishID", (req, res) => {

	if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }

	const {dishID} = req.params;
	const dish = dishesModel.getDishByID(dishID);

	if (dish) {
		console.log(dish);
		res.json(dish);
	} else {
		res.sendStatus(404);
	}
});

// create new dish
app.post("/dishes", (req, res) => {
    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	console.log(req.body);


	let dishID = uuidV4();
    let {name, description, price, dishType, photoUrl} = req.body;

    price = parseFloat(price);

    const didCreateDish = dishesModel.createDish({
		dishID,
        name, description, price, dishType, photoUrl
    });

    if (didCreateDish) {
        res.redirect("/admin-dishes");
    } else {
        res.sendStatus(500);
    }
});

// Update dish information
app.post("/dishes/:dishID", (req, res) => {
    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	let dishID = req.params.dishID;
	let { name, description, price, dishType, photoUrl } = req.body;

    price = parseFloat(price);

    const didUpdateDish = dishesModel.updateDishByID({
		dishID,
        name, description, price, dishType, photoUrl
    });

    if (didUpdateDish) {
        res.redirect("/admin-dishes");
    } else {
        res.sendStatus(500);
    }
});

// delete a single dish
app.delete("/dishes/:dishID", (req, res) => {
	console.log("DELETE /dishes");

    if ( !req.session || req.session.role !== 0 ) {
		console.log('Session does not exist');
        return res.sendStatus(403); // Forbidden 
    }
	const dishID = req.params.dishID;

    const didDeleteDish = dishesModel.deleteDish(
		dishID
    );

    if (didDeleteDish) {
		
		console.log('Delete dish successfully');
		res.sendStatus(200);
   
    } else {
        res.sendStatus(500);
    }
});

//Add dishes to shopping cart
app.post("/add-dishtocart/:userID", (req, res) => {
	if(!req.session){
		return res.redirect("/login");		//redirect user to login page
	}

	const userID = req.params;
	const dishID = req.query.dishID;
	const dish = dishesModel.getDishByID(dishID);

	if(JSON.stringify(dish) !== '{}'){
		if(req.session.hasOwnProperty('totalDishes')){
			if(req.session.totalDishes < 7){
				req.session.shoppingCart.push(dish);
				req.session.totalDishes +=1;
				return res.send(200);
			}
			return res.send(400);
		} else{
			req.session.totalDishes = 1;
			req.session.shoppingCart = [
				dish
			];

			return res.sendStatus(200);
		}
	}
	return res.sendStatus(404);
	
});

//Delete dishes to shopping cart
app.delete("/add-dishtocart/:userID", (req, res) => {
	if(!req.session){
		return res.redirect("/login");		//redirect user to login page
	}

	const userID = req.params;
	const dishID = req.query.dishID;
	const dishIndex = req.query.dishIndex;
	let isFound = false;
		if(req.session.hasOwnProperty('totalDishes')){

			for (let i = 0; i < req.session.shoppingCart.length; i++)
			{
				if (req.session.shoppingCart[i].dishID === dishID)
				{
					req.session.shoppingCart.splice(i, 1);
					isFound = true;
				}
			}

			if (isFound){
				req.session.totalDishes -= 1;
				return res.sendStatus(200);
				
			}

	
		}
	
	return res.sendStatus(404);
	
});

//Get all the dishes for user from shopping cart
app.get("/addeditems/:userID", async (req, res) => {
	if(!req.session){
		return res.redirect('/login');
	}

	const userID = req.params;
	const items = req.session.shoppingCart;
	let dishesList = [];
	let menuList = [];
	let totalPrice = 0.0;
	let title = "";
	console.log(items);
	if (items !== undefined && items.length >0)
	{
		// title = "YOUR CUSTOMIZED MENU SET";
		// dishesList =items;
		if (items[0].menuID !== undefined)
		{
			title = "YOUR SELECTED MENU SET";
			menuList = items;
		}
		else{
			title = "YOUR CUSTOMIZED MENU SET";
			dishesList =items;
		}

		let sumPrice = 0.0;
		for (let i =0; i < items.length; i++)
			sumPrice = sumPrice + items[i].price;
		totalPrice = sumPrice

	}

	res.render("checkoutPage", {dishesList,menuList, totalPrice, title});

});



//Add menusets to shopping cart
app.post("/add-menutocart/:userID", (req, res) => {
	if(!req.session){
		return res.redirect("/login");		//redirect user to login page
	}

	const userID = req.params;
	const menuID = req.query.menuID;
	const menuSet = menuSetsModel.getMenuSetById(menuID);

	if(JSON.stringify(menuSet) !== '{}'){
		req.session.totalMenuSets = 1;
			req.session.shoppingCart = [
				menuSet
			];

			return res.sendStatus(200);
	}
	return res.sendStatus(404);
	
});

//Delete menuset to shopping cart
app.delete("/add-menutocart/:userID", (req, res) => {
	if(!req.session){
		return res.redirect("/login");		//redirect user to login page
	}


	if (req.session.shoppingCart.length > 0)
	{	req.session.shoppingCart.pop();
	
		return res.sendStatus(200);
	}
	
	return res.sendStatus(404);
	
});

//Create order
app.post("/order/:userID", (req, res) => {
	console.log("/POST /order");
	if(!req.session){
		return res.redirect("/login");		//redirect user to login page
	}

	const userID = req.params.userID;
//	let {serviceType} = req.body;
	//let selectedMenu = req.session.shoppingCart;
	let arrayForDb = [];
	console.log(req.session.shoppingCart)
	for (let item in req.session.shoppingCart)
	{
		console.log("HELLO WORLD");
		console.log(req.session.shoppingCart[item]);
		if (req.session.shoppingCart[item].dishID !== undefined){
		
			arrayForDb.push(req.session.shoppingCart[item].dishID);
		}
		else if (req.session.shoppingCart[item].menuID !== undefined) {
			arrayForDb.push(req.session.shoppingCart[item].menuID);
		}
	}

	let selectedMenu = arrayForDb.toString();
	let date = new Date().toLocaleString();
	const orderObj = ({
		userID,
		date, selectedMenu
	});
	const orderID = ordersModel.createOrder(orderObj);
	
	if(orderID){
		const text = `Thank you for ordering form Hoang Chau Culinary. Your order number is ${orderID}.`;
		const html = (
			"<h1 style=\"margin-bottom: 1rem;\">Thank you for ordering form Hoang Chau Culinary!</h1>" +
			"<p>" +
				`Your order number is ${orderID}` +
			"</p>"
		);
		console.log(orderID);
		const subject = `Your order number ${orderID}`;
		const to = req.session.email;
		sendEmail(to, subject, text, html);
		delete req.session.shoppingCart;
		delete req.session.totalMenuSets;
		delete req.session.totalDishes;
		return res.sendStatus(200);
	}
	return res.sendStatus(404);
});

//change service type
app.post("/updateservicetype/:orderID", (req, res) => {
	console.log("/POST /updateservicetype");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}
	
	const orderID = req.params;
	const serviceType = req.query;
	const didchangeServiceType = ordersModel.changeServiceType(serviceType, orderID);
	if(didchangeServiceType){
		res.sendStatus(200);
	} else{
		res.sendStatus(400);
	}
});

//change selected menu
app.post("/updateselectedmenu/:orderID", (req, res) => {
	console.log("/POST /updateselectedmenu");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}
	
	const orderID = req.params;
	const selectedMenu = req.query;
	const didchangeSelectedMenu = ordersModel.changeSelectedMenu(selectedMenu, orderID);
	if(didchangeSelectedMenu){
		res.sendStatus(200);
	} else{
		res.sendStatus(400);
	}
});

// Delete order
app.delete("/order/:orderID", (req, res) => {
	console.log("/DELETE /order");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}

	const orderID = req.params;
	const orderDeleted = ordersModel.deleteOrder(orderID);
	if(orderDeleted){
		res.sendStatus(200);
	} else{
		res.sendStatus(400);
	}
});

// Get order
app.get("/order", (req, res) => {
	console.log("/GET /order");
	if(!req.session && req.session.role !== 1){
		return res.sendStatus(403); // Forbidden
	}

	const orders = ordersModel.getAllOrder();

	if(orders.length > 0){
		return res.json(orders).sendStatus(200);
	}
	return res.sendStatus(400);
});

// Get order by orderID
app.get("/order/:orderID", (req, res) => {
	console.log("/GET /order/:orderID");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}

	const orderID = req.params;
	const orders = ordersModel.getOrder(orderID);

	if(orders){
		return res.json(orders).sendStatus(200);
	}
	return res.sendStatus(400);
});

// Get selected menu
app.get("/orderselectedmenu/:orderID", (req, res) => {
	console.log("/GET /orderselectedmenu/:orderID");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}

	const orderID = req.params;
	const order = ordersModel.getSelectedMenu(orderID);

	if(order){
		return res.json(order).sendStatus(200);
	}
	return res.sendStatus(400);
});

// Get service type
app.get("/orderservicetype/:orderID", (req, res) => {
	console.log("/GET /orderservicetype/:orderID");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}

	const orderID = req.params;
	const serviceType = ordersModel.getServiceType(orderID);

	if(serviceType){
		return res.json(serviceType).sendStatus(200);
	}
	return res.sendStatus(400);
});

// Get booking date
app.get("/orderbooking/:orderID", (req, res) => {
	console.log("/GET /orderbooking/:orderID");
	if(!req.session){
		return res.sendStatus(403); // Forbidden
	}

	const orderID = req.params;
	const booking = ordersModel.getBookingDate(orderID);

	if(booking){
		return res.json(booking).sendStatus(200);
	}
	return res.sendStatus(400);
});




app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

