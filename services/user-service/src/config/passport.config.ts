import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import authService from '../services/auth.service';
import { createLogger } from '@mallify/shared';

const logger = createLogger('passport-config');

/**
 * Configure Google OAuth Strategy
 */
export const configurePassport = () => {
  // Only configure Google OAuth if credentials are provided
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
          try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const profileImage = profile.photos?.[0]?.value;

            if (!email) {
              return done(new Error('Email not provided by Google'));
            }

            // Use auth service to handle Google login/registration
            const result = await authService.googleLogin(googleId, email, name, profileImage);

            logger.info(`Google OAuth successful for user: ${email}`);
            // Pass user data for Express to attach to req.user
            return done(null, result.user as any);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured');
  } else {
    logger.warn('Google OAuth credentials not provided - OAuth login disabled');
  }

  // Only configure Facebook OAuth if credentials are provided
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;

  if (facebookAppId && facebookAppSecret) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: facebookAppId,
          clientSecret: facebookAppSecret,
          callbackURL:
            process.env.FACEBOOK_CALLBACK_URL ||
            'http://localhost:3001/api/auth/facebook/callback',
          profileFields: ['id', 'displayName', 'photos', 'email'],
          enableProof: true,
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: FacebookProfile,
          done: VerifyCallback
        ) => {
          try {
            const facebookId = profile.id;
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const profileImage = profile.photos?.[0]?.value;

            if (!email) {
              return done(new Error('Email not provided by Facebook'));
            }

            const result = await authService.facebookLogin(
              facebookId,
              email,
              name,
              profileImage
            );

            logger.info(`Facebook OAuth successful for user: ${email}`);
            return done(null, result.user as any);
          } catch (error) {
            logger.error('Facebook OAuth error:', error);
            return done(error as Error);
          }
        }
      )
    );
    logger.info('Facebook OAuth strategy configured');
  } else {
    logger.warn('Facebook OAuth credentials not provided - OAuth login disabled');
  }

  // Serialize user for session (not used in JWT-based auth, but required by Passport)
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

export default passport;
