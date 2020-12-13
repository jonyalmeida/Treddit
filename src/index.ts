import { MikroORM } from "@mikro-orm/core";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    //connect to database
    const orm = await MikroORM.init(mikroConfig);
    //run migrations
    await orm.getMigrator().up();

    //create express app
    const app = express();

    //create and configure Apollo Server
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }),
    });

    apolloServer.applyMiddleware({ app });

    app.listen(8081, () => console.log("Listening on port 8081..."));
};

main().catch((err) => console.log(err));
