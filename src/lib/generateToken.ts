import jwt from 'jsonwebtoken';

const generateToken = (id: string, email: string, role: string): string => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d',
    });
};

export default generateToken;
