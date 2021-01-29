import "reflect-metadata";
import Koa from "koa";
import { ApolloServer } from "apollo-server-koa"
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typedi";
import ResponseTimeMiddleware from "koa-response-time"
import CompressMiddleware from "koa-compress";
import CorsMiddleware from "@koa/cors";
import { genSecrect } from "./util/secret";
import { setupUserContext } from "./context"



import {
    APP_HOST, APP_PORT, APP_SECRET,  APP_PROXY, PG_HOST, PG_PORT, PG_USERNAME, PG_PASSWORD, PG_DATABASE
  } from "./config";
import { AppUserContextMiddleware } from "./auth/AppUserContextMiddleware";
import { authChecker } from "./auth/AuthChecker";


async function setupDatabase(): Promise<void> {
    useContainer(Container);
    await createConnection({
        type: "postgres",
        host: PG_HOST,
        port: PG_PORT,
        username: PG_USERNAME,
        password: PG_PASSWORD,
        database: PG_DATABASE,
        synchronize: true,
        logging: "all",
        entities: [`${__dirname}/entity/**/*.{ts,js}`]
    });
}

async function setupGraphqlSchema(): Promise<GraphQLSchema> {
    const schema = await buildSchema({
        resolvers: [`${__dirname}/resolver/**/*.{ts,js}`],
        container: Container,
        authChecker: authChecker
    });

    return schema;
}

async function setupApolloServer(schema: GraphQLSchema): Promise<ApolloServer> {
    const server = new ApolloServer({
        schema,
        playground: true,
        context: ({ ctx }) => ctx
    });
    return server;
}



async function setupKoa(server: ApolloServer): Promise<Koa> {
    const app = new Koa();

    app.proxy = APP_PROXY;
    app.keys = [APP_SECRET ? APP_SECRET : genSecrect()];

    app.use(ResponseTimeMiddleware({ hrtime: true }));
    app.use(CorsMiddleware({ credentials: true }));
    app.use(AppUserContextMiddleware);
    app.use(CompressMiddleware());
    app.use(server.getMiddleware());

    setupUserContext(app);

    return app;
}

(async function main(): Promise<void> {
    await setupDatabase();
    const schema: GraphQLSchema = await setupGraphqlSchema();
    const server: ApolloServer = await setupApolloServer(schema);
    const app: Koa = await setupKoa(server);
    await new Promise<void>((resolve) => {
        app.listen({ host: APP_HOST, port: APP_PORT}, resolve);
    });
    console.log(`app keys: ${app.keys}`);
    console.log(`🚀 Server ready at http://${APP_HOST}:${APP_PORT}${server.graphqlPath}`);
})();
