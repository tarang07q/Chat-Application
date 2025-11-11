import { User } from '../../database';
import { AppError } from '../../middlewares/errorHandler';
import { generateTokenPair, verifyRefreshToken, TokenPayload } from './jwt.utils';

export class AuthService {
  async register(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError(400, 'Email already registered');
      }
      throw new AppError(400, 'Username already taken');
    }

    // Create new user
    const user = new User({
      username,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      provider: 'local',
    });

    await user.save();

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    const tokens = generateTokenPair(tokenPayload);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    const tokens = generateTokenPair(tokenPayload);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    
    // Update last active
    user.lastActive = new Date();
    user.status = 'online';
    
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Verify token
      const payload = verifyRefreshToken(refreshToken);

      // Find user and check if token exists
      const user = await User.findById(payload.id);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Remove old token
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);

      // Generate new tokens
      const tokenPayload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      };

      const tokens = generateTokenPair(tokenPayload);

      // Store new refresh token
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      return tokens;
    } catch (error) {
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (refreshToken) {
      // Remove specific token
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    } else {
      // Remove all tokens (logout from all devices)
      user.refreshTokens = [];
    }

    user.status = 'offline';
    await user.save();

    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      lastActive: user.lastActive,
    };
  }
}

export const authService = new AuthService();
