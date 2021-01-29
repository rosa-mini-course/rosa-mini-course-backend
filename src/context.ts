import Application, { ParameterizedContext } from 'koa';

import { Session } from 'koa-session';

import { User } from "./entity/User";

export interface AppSession extends Session {
    userId?: number
}

export type AppContext = ParameterizedContext<Record<string, unknown>> & { session: AppSession | null }

export type AppUserState = {
    user?: User
}

export type AppUserContext = AppContext & {
    state: AppUserState
    setSessionUser: (user: User | undefined) => void
    getSessionUser: () => User | undefined
}

export function setupUserContext(app: Application): void {
    app.context.setSessionUser = function (this: AppUserContext, user: User | undefined) {
        this.state.user = user;
    }

    app.context.getSessionUser = function (this: AppUserContext): User | undefined {
        return this.state.user;
    }
}