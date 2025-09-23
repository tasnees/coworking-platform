import { IUserDocument } from '../models/User';
import { generateToken } from '../utils/jwt';
import { Document } from 'mongoose';

// -------------------------------
// 1. Body Types
// -------------------------------

interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

type UpdatePasswordRequest = AuthenticatedRequest & { body: UpdatePasswordBody };

// -------------------------------
// 6. Controllers
// -------------------------------

export const logout = (): void => {
  console.log('User logged out successfully');
};

export const updatePassword = async (
  req: UpdatePasswordRequest
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user as IUserDocument;

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

    // Generate new tokens with the user object
    const { accessToken: token, refreshToken } = generateToken(user);

    console.log('Password updated successfully', {
      success: true,
      token,
      refreshToken,
      user: {
        id: (user as Document & { _id: any })._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
    return;
  } catch (error: unknown) {
    console.error('500 - Failed to update password due to an unknown error');
    if (error instanceof Error) {
      console.error(`500 - Failed to update password: ${error.message}`);
      return;
    }
  }
};

export const getMe = (req: AuthenticatedRequest): void => {
  const user = req.user as IUserDocument;
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
    user: userData as Omit<IUserDocument, 'password'> 
  });
  return;
};