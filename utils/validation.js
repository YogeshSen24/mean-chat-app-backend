// validation.js

// Function to validate user data
const validateRegistrationData = (userData) => {
    const { username, email, password } = userData;

    if (!username || typeof username !== 'string') {
        throw new Error('Username is required and must be a string');
    }

    if (!email || typeof email !== 'string') {
        throw new Error('Email is required and must be a string');
    }

    if (!password || typeof password !== 'string') {
        throw new Error('Password is required and must be a string');
    }
};

// Function to validate message data
const validateMessage = (messageData) => {
    const { sender, receiver, content } = messageData;

    if (!sender || typeof sender !== 'string') {
        throw new Error('Sender is required and must be a string');
    }

    if (!receiver || typeof receiver !== 'string') {
        throw new Error('Receiver is required and must be a string');
    }

    if (!content || typeof content !== 'string') {
        throw new Error('Content is required and must be a string');
    }
};

// Function to validate chat data
const validateChat = (chatData) => {
    const { participants } = chatData;

    if (!Array.isArray(participants) || participants.length < 2) {
        throw new Error('Chat must have at least 2 participants');
    }
};

// Function to validate request data
const validateRequest = (requestData) => {
    const { sender, receiver, type } = requestData;

    if (!sender || typeof sender !== 'string') {
        throw new Error('Sender is required and must be a string');
    }

    if (!receiver || typeof receiver !== 'string') {
        throw new Error('Receiver is required and must be a string');
    }

    if (!type || typeof type !== 'string') {
        throw new Error('Type is required and must be a string');
    }
};

export  {
    validateRegistrationData,
    validateMessage,
    validateChat,
    validateRequest
};
