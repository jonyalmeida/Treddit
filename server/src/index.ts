import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

//options for cors middleware
const options: cors.CorsOptions = {
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
    ],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: "http://localhost:3000",
    preflightContinue: false,
};

const main = async () => {
    //connect to database
    const orm = await MikroORM.init(mikroConfig);
    //run migrations
    await orm.getMigrator().up();

    //create express app
    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    //use cors middleware
    app.use(cors(options));

    //enable pre-flight
    app.options("*", cors(options));

    app.use(
        session({
            name: "qid",
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 14,
                httpOnly: true,
                sameSite: "lax", //csrf
                secure: __prod__, //cookie only works in https
            },
            saveUninitialized: false,
            secret: "adiodh8392dh3829hdj92hw892qh3w89dh2q893",
            resave: false,
        })
    );

    //create and configure Apollo Server
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
    });

    apolloServer.applyMiddleware({
        app,
        //apply apollo cors middleware
        cors: { origin: false },
    });

    app.listen(8081, () => console.log("Listening on port 8081..."));
};

main().catch((err) => console.log(err));
