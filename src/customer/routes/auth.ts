import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { GetOneDocument } from '../../connector/mongodb';
import { CollectionName } from '../../types/mongoType';
import { AuthUser } from '../../types/responseType';
import { User, UserHash } from '../../types/collection/user';
import ENV_PROP from '../../config/config';
import { isObjectId, jwtSigninToken, validPassword } from '../../helper/shared';

passport.serializeUser((user: Express.User, done): void => {
  done(null, user);
});
passport.deserializeUser((user: AuthUser, done): void => {
  done(null, user);
});
passport.use(
  'customersignin',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true, // allows us to pass back the entire request to the callback
    },
    (req, username, password, done): void => {
      (async () => {
        const user = (await GetOneDocument(
          CollectionName.User,
          {
            $or: [{ email: { $eq: username } }],
            internalstatus: 1,
            externalstatus: 1,
          },
          { _id: 1, email: 1, firstname: 1 }
        )) as User;
        if (!user || !isObjectId(user._id)) {
          req.flash('message', 'Invalid Account Details');
          done(null, false);
        } else {
          const userHash = (await GetOneDocument(
            CollectionName.UserCred,
            {
              userid: { $eq: user._id },
              internalstatus: 1,
              externalstatus: 1,
            },
            { _id: 1, hash: 1 }
          )) as UserHash;
          if (!userHash || !isObjectId(userHash._id)) {
            req.flash('message', 'Invalid Account Details');
            done(null, false);
          } else {
            if (validPassword(password, userHash.hash)) {
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
                  sub: 'lead',
                },
                ENV_PROP.CUSTOMER_SECRET_KEY,
                ENV_PROP.CUSTOMER_JWT_EXPIRES
              );
              done(null, {
                username: user.email,
                id: user._id,
                name: user.firstname,
                header: authHeader,
              });
            }
          }
        }
      })().catch((_err) => {
        req.flash('message', 'Server error');
        done(null, false);
      });
    }
  )
);
