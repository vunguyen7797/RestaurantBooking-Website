"use strict";

const VALIDATION_OPTIONS = {
	abortEarly: false,
	stripUnknown: true, 
	errors: {
		escapeHtml: true,
	}
};

const {userSchema} = require("./userValidator");

const schemas = {
	userSchema,
};

exports.schemas = schemas;
exports.VALIDATION_OPTIONS = VALIDATION_OPTIONS;