import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
    }
  }
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "brandlab-super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
          });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      });
    } catch (err) {
      done(err);
    }
  });
}
