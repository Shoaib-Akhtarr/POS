import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d',
    });
};

export default generateToken;
