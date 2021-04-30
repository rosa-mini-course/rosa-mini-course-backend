import { Authorized, FieldResolver, Resolver, Mutation, ResolverInterface, Ctx, Arg, UseMiddleware, InputType, ObjectType, Field } from "type-graphql";
import { Service } from "typedi";
import { getManager } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { AppUserContext } from "../../context";
import { Course, User } from "../../entity";
import { CourseRepository, UserRepository } from "../../repository";
import { LoadCourseIntoContext } from "./SubscriptionGuard";

@ObjectType()
class UserCourse {
    @Field()
    userId!: number;

    @Field()
    courseId!: string;
};

@Service()
@Resolver()
export class SubscriptionResolver {
    @InjectRepository()
    private readonly userRepository!: UserRepository;

    @InjectRepository()
    private readonly courseRepository!: CourseRepository;

    @Authorized()
    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" })
    )
    @Mutation(() => UserCourse)
    async subscribeCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string): Promise<UserCourse> {
        let user = ctx.getSessionUser() as User;
        const courseToSubscribe = ctx.state.course as Course;
        user = await getManager().findOneOrFail(User, { where: { userId: user.userId }, relations: ["subscribedCourses"] });
        user.subscribedCourses!.push(courseToSubscribe);
        await getManager().save(user);
        return { userId: user.userId, courseId: courseToSubscribe.courseId } as UserCourse;
    }

    @Authorized()
    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" })
    )
    @Mutation(() => UserCourse)
    async unsubscribeCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string): Promise<UserCourse> {
        let user = ctx.getSessionUser() as User;
        const courseToUnsubscribe = ctx.state.course as Course;
        user = await getManager().findOneOrFail(User, { where: { userId: user.userId }, relations: ["subscribedCourses"] });
        user.subscribedCourses = user.subscribedCourses!.filter(subscribeCourse => {
            return subscribeCourse.courseId !== courseToUnsubscribe.courseId; 
        });
        await getManager().save(user)
        return { userId: user.userId, courseId: courseToUnsubscribe.courseId } as UserCourse;
    }
}