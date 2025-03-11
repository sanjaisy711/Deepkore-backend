import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { GetOneDocument } from '../../connector/mongodb';
import { CollectionName } from '../../types/mongoType';
import { AuthUser } from '../../types/responseType';
import ENV_PROP from '../../config/config';
import { isObjectId, jwtSigninToken, validPassword } from '../../helper/shared';
import { DzitraUser } from '../../types/collection/dzitrauser';

passport.serializeUser((user: Express.User, done): void => {
  done(null, user);
});
passport.deserializeUser((user: AuthUser, done): void => {
  done(null, user);
});
passport.use(
  'adminsignin',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    (req, username, password, done): void => {
      (async () => {
        //console.log(username);
        //console.log(password);
        const user = (await GetOneDocument(
          CollectionName.DzitraUser,
          {
            $or: [{ email: { $eq: username } }],
            internalstatus: 1,
            externalstatus: 1,
          },
          { _id: 1, email: 1, name: 1, hash: 1 }
        )) as DzitraUser;
        if (!user || !isObjectId(user._id)) {
          req.flash('message', 'Invalid Account Details');
          done(null, false);
        } else {
          if (validPassword(password, user.hash as string)) {
            req.flash(
              'message',
              'You are not authorized to sign in. Verify that you are using valid credentials'
            );
            done(null, false);
          } else {
            const authHeader: string = jwtSigninToken(
              {
                id: user._id,
                username: user.email,
                sub: 'admin',
              },
              ENV_PROP.ADMIN_SECRET_KEY,
              ENV_PROP.ADMIN_JWT_EXPIRES
            );
            done(null, {
              username: user.email,
              id: user._id,
              name: user.name,
              header: authHeader,
            });
          }
        }
      })().catch((_err) => {
        req.flash('message', 'Server error');
        done(null, false);
      });
    }
  )
);
