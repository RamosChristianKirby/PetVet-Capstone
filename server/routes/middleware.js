import jwt from 'jsonwebtoken';

// Secret key used for JWT token verification.

const SECRET_KEY = 's3cr3t';

// Authentication middleware to validate JWT tokens in requests.

const auth = async (req, res, next) => {
    try {

        // Extracting the token from the Authorization header.
        // The token is expected to follow the 'Bearer [token]' format.

        const token = req.headers.authorization.split(' ')[1];

        // Verifying the token using the secret key.
        // Decoded data will contain the payload of the JWT token.

        const decodedData = jwt.verify(token, SECRET_KEY);

        // Attaching the userId and userRole from the token to the request object.
        // This makes these values available in the request handling pipeline.

        req.userId = decodedData?.id;
        req.userRole = decodedData?.role;

        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

export default auth;
