import { setupGraphqlSchema, setupApolloServer, setupKoa } from "../src/main";
import { useContainer, createConnection } from "typeorm";
import { Container } from "typedi";
import path from 'path'

describe('test src/main.ts', () => {
    jest.useFakeTimers();

    // const root = path.resolve(__dirname, "..");
    // const setupSqlite = async () => {
    //     useContainer(Container);
    //     await createConnection({
    //         type: "sqlite",
    //         database: `${root}/data.sqlite`,
    //         entities: [`${__dirname}/entity/**/*.{ts,js}`],
    //         synchronize: true,
    //         logging: true
    //     });
    // };

    // beforeAll(async () => {
    //     setupSqlite();
    // });
})