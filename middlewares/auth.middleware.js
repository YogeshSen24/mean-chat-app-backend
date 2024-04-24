// authMiddleware.js

import jwt from "jsonwebtoken"

// Authentication middleware function for HTTP requests
const authenticateUser = (req, res, next) => {
    // Extract token from request headers
    const token = req.cookies.token;

    // Check if token is present
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request object
        req.user = decoded;

        // Proceed to next middleware or route handler
        next();
    } catch (err) {
        // Token is invalid
        console.error(err.message);
        res.status(401).json({ message: 'Invalid authorization token' });
    }
};

// Authentication middleware function for socket connections
const socketAuthMiddleware = (socket, next) => {
    // Extract token from handshake headers
    const token = socket.handshake.auth.token;

    // Check if token is present
    if (!token) {
        return next(new Error('Authorization token is missing'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Attach user data to socket object
        socket.user = decoded.user;

        // Proceed to socket connection
        next();
    } catch (err) {
        // Token is invalid
        console.error(err.message);
        next(new Error('Invalid authorization token'));
    }
};

export{
    authenticateUser,
    socketAuthMiddleware
};
