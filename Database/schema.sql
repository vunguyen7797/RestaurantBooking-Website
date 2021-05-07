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
    price REAL DEFAULT 0.0,
    category TEXT,
    FOREIGN KEY (category) REFERENCES MenuCategories(catId) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MenuContent (
    menuID TEXT,
    dish TEXT,
    FOREIGN KEY (dish) REFERENCES Dishes(dishID),
    FOREIGN KEY (menuID) REFERENCES MenuSets(menuID) ON DELETE CASCADE
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
    selectedMenu TEXT NOT NULL,
    FOREIGN KEY (customer) REFERENCES Users(userID)
);

CREATE TABLE IF NOT EXISTS MenuCategories(
    catId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    photoUrl TEXT NOT NULL
);



-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c1", "Wedding Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Fco-dam-cuoi.jpg?alt=media&token=b336f8fe-d574-4b3e-86bc-2c26f27a966e");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c2", "New House Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Ftiec-tan-gia-ngoai-troi.jpg?alt=media&token=05bb0fea-3f92-4604-b094-3642370d53da");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c3", "Vegan Menus", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Fthuc-don-chay-4-mon-sieu-de-lam-chi-voi-65k-3.jpg?alt=media&token=704fdd61-9979-470c-a2c6-9b68dd9cbb9d");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c4", "Birthday Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2FBirthday_MobileBanner.jpg?alt=media&token=ade74346-c37f-4a9c-acb7-5981f44ab085");

-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c5", "Dessert Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2F2018-10-26-21_04_45-Rivers-of-Light-Dessert-Party-at-Animal-Kingdom-_-Walt-Disney-World-Resort-720x340.jpg?alt=media&token=2fb7813e-02fb-46e3-ae9d-8ce872097afc");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c6", "Buffet Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Feac52543bd0890475886a7bb6a1fd488.jpg?alt=media&token=390c1a9b-c94e-4586-9daa-49257d1e0b10");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c7", "Baby Shower Party", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Ftrang-tri-ban-tiec-thoi-noi-cho-be-khoi.jpg?alt=media&token=47dbdaaf-503c-4ae0-9601-26e4afd50c42");
-- INSERT INTO MenuCategories (catId, name, photoUrl) VALUES ("c8", "Exclusive Menus", "https://firebasestorage.googleapis.com/v0/b/qpv-face-scanner.appspot.com/o/webproject%2Ftradition-vietnamese-new-year-food-fi.jpg?alt=media&token=5eab9087-d026-467e-93ac-ce2c15340cfa");

