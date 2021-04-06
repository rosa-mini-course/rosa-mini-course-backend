import { ApolloError } from "apollo-server-errors";
import { Args, MiddlewareFn, NextFn, ResolverData } from "type-graphql";
import { getCustomRepository } from "typeorm";
import { AppContext, AppUserContext } from "../../context";
import { CourseRepository } from "../../repository";
import { Course, User } from "../../entity";
import Container from "typedi";
import { CourseService } from "../../service";


type CourseGuardArgs = {
    argKey?: string
    ctxKey?: string
}

export function LoadCourseIntoContext({ argKey = "courseId", ctxKey = "course" }: CourseGuardArgs): MiddlewareFn<AppContext> {
    return async({ context, args }: ResolverData<AppContext>, next: NextFn) => {
        const courseId = String(args[argKey]);
        const course = await getCustomRepository(CourseRepository).findOne({ courseId });
        if (!course) {
            throw new ApolloError("Course 不存在。");
        }

        context.state[ctxKey] = course;
        return next();
    };
}

export function ContextCourseAccessible({ ctxKey = "course" }: Omit<CourseGuardArgs, "argKey">): MiddlewareFn<AppUserContext> {
    return async ({ context }: ResolverData<AppUserContext>, next: NextFn) => {
        const user = context.getSessionUser() as User;
        const course = context.state[ctxKey] as Course;

        if (!(await Container.get(CourseService).accessibleBy(course, user))) {
            throw new ApolloError("Course 不可访问。");
        }

        return next();
    };
}
