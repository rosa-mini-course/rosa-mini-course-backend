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
import { setupUserContext } from "./context";
import SessionMidddleWare from "koa-session";
import KoaRedis from "koa-redis";
import IORedis, { Redis } from "ioredis";
import {
    APP_HOST, APP_PORT, APP_SECRET,  APP_PROXY, PG_HOST, PG_PORT, PG_USERNAME, PG_PASSWORD, PG_DATABASE, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT
  } from "./config";
import { AppUserContextMiddleware } from "./auth/AppUserContextMiddleware";
import { authChecker } from "./auth/AuthChecker";
import { exitCodes } from "./const/exitCodes";
import { videoRouter } from "./router"


export async function setupRedis(): Promise<Redis> {
    const redis: Redis = new IORedis(REDIS_PORT, REDIS_HOST, { password: REDIS_PASSWORD });
    await redis.ping().catch(err => {
        console.error(err);
        process.exitCode = exitCodes.redisPingError;
    })
    return redis;
}

export async function setupDatabase(): Promise<void> {
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

export async function setupGraphqlSchema(): Promise<GraphQLSchema> {
    const schema = await buildSchema({
        resolvers: [`${__dirname}/resolver/**/*.{ts,js}`],
        container: Container,
        authChecker: authChecker
    });

    return schema;
}

export async function setupApolloServer(schema: GraphQLSchema): Promise<ApolloServer> {
    const server = new ApolloServer({
        schema,
        playground: true,
        context: ({ ctx }) => ctx
    });
    return server;
}



export async function setupKoa(redis: Redis, server: ApolloServer): Promise<Koa> {
    const app = new Koa();

    app.proxy = APP_PROXY;
    app.keys = [APP_SECRET ? APP_SECRET : genSecrect()];

    app.use(ResponseTimeMiddleware({ hrtime: true }));
    app.use(CorsMiddleware({ credentials: true }));
    app.use(SessionMidddleWare({
        maxAge: 1000 * 60 * 60 * 24 * 7,
        key: "moment:sess",
        store: KoaRedis({ client: redis })
    }, app));
    app.use(AppUserContextMiddleware);
    app.use(CompressMiddleware());
    app.use(server.getMiddleware());

    app.use(videoRouter.routes()).use(videoRouter.allowedMethods())

    setupUserContext(app);

    return app;
}

(async function main(): Promise<void> {
    const redis: Redis = await setupRedis();
    await setupDatabase();
    const schema: GraphQLSchema = await setupGraphqlSchema();
    const server: ApolloServer = await setupApolloServer(schema);
    const app: Koa = await setupKoa(redis, server);
    await new Promise<void>((resolve) => {
        app.listen({ host: APP_HOST, port: APP_PORT}, resolve);
    });
    console.log(`app proxy: ${app.proxy}`);
    console.log(`app keys: ${app.keys}`);
    console.log(`🚀 Server ready at http://${APP_HOST}:${APP_PORT}${server.graphqlPath}`);
})();
