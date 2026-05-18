import jwt from 'jsonwebtoken';

/**
 * Generates and sets access and refresh tokens in secure cookies.
 */
const generateTokens = (res, userId) => {
    // 1. Generate Access Token (Short-lived)
    const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
    });

    // 2. Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    });

    // 3. Set Cookie Options
    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    // 4. Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
        ...commonCookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // 5. Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
        ...commonCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return refreshToken; // Return this to be stored in the database
};

export default generateTokens;

