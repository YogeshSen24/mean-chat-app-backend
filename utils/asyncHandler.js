// controllers.js

import myError from './customErrors.js';

// Function to wrap controller methods with try-catch blocks
const asyncHandler = (controllerFunction) => {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next);
        } catch (err) {
            // Pass error to error handler
            next(new myError(err.message, err.status));
        }
    };
};

export  default asyncHandler
