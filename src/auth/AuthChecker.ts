import { AuthChecker } from "type-graphql";
import { AppUserContext } from "../context";

export const authChecker: AuthChecker<AppUserContext> = async ({ context: ctx }, roles) => {
    const user = ctx.getSessionUser();

    if (!user) {
        return false
    }
    
    if (roles.length === 0) {
        return user ? true : false;
    }

    if (roles.indexOf(user.role) > -1) {
        return true;
    }

    return false;
}
