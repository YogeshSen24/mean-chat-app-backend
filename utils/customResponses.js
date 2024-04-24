// customResponses.js

const Response = (res, data = {}, statusCode = 200, message = 'Success' ) => {
    return res.status(statusCode).json({ success: true, message, data });
};

export default Response
