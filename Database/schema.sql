CREATE TABLE IF NOT EXISTS Dishes (
    dishID TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    dishType TEXT NOT NULL,
    photoUrl TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS MenuSets (
    menuID TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    numberDishes INTEGER NOT NULL CHECK (numberDishes > 0),
    price REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS MenuContent (
    menuID TEXT,
    dish TEXT,
    FOREIGN KEY (dish) REFERENCES Dishes(dishID),
    FOREIGN KEY (menuID) REFERENCES MenuSets(menuID)
);



CREATE TABLE IF NOT EXISTS Users (
    userID TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role INTEGER NOT NULL DEFAULT 0, -- default to "user" role
    email TEXT UNIQUE NOT NULL,
    didVerifyEmail BOOLEAN NOT NULL DEFAULT 0, -- defaults to unverified,
    phoneNumber TEXT NOT NULL,
    address TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Orders (
    orderID TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    bookingDate TEXT NOT NULL,
    serviceType TEXT NOT NULL,
    selectedMenu TEXT NOT NULL,
    FOREIGN KEY (customer) REFERENCES Users(userID),
    FOREIGN KEY (selectedMenu) REFERENCES MenuSets(user)
);