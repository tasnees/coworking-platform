"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.updatePassword = exports.logout = void 0;
const jwt_1 = require("../utils/jwt");
// -------------------------------
// 6. Controllers
// -------------------------------
const logout = () => {
    console.log('User logged out successfully');
};
exports.logout = logout;
const updatePassword = async (req) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;
        if (!user) {
            console.log('401 - Not authorized');
            return;
        }
        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            console.log('400 - Current password is incorrect');
            return;
        }
        // Update password
        user.password = newPassword;
        await user.save();
        // Convert to plain object for token generation
        const userObj = user.toObject ? user.toObject() : user;
        userObj.id = user._id.toString();
        // Generate new tokens
        const { accessToken: token, refreshToken } = (0, jwt_1.generateToken)(userObj);
        console.log('Password updated successfully', {
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
        return;
    }
    catch (error) {
        console.error('500 - Failed to update password due to an unknown error');
        if (error instanceof Error) {
            console.error(`500 - Failed to update password: ${error.message}`);
            return;
        }
    }
};
exports.updatePassword = updatePassword;
const getMe = (req) => {
    const user = req.user;
    if (!user) {
        // Using console.log for debugging purposes
        // eslint-disable-next-line no-console
        console.log('Not authenticated');
        console.log('401 - Not authenticated');
        return;
    }
    const userObject = user.toObject();
    // Destructure password without using it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = userObject;
    // Store the stringified user data in a variable before logging
    const userDataString = JSON.stringify(userData, null, 2);
    // Using console.log for debugging purposes
    // eslint-disable-next-line no-console
    console.log('User data retrieved:', userDataString);
    // Using console.log for debugging purposes
    // eslint-disable-next-line no-console
    console.log('User data retrieved:', {
        success: true,
        user: userData
    });
    return;
};
exports.getMe = getMe;
