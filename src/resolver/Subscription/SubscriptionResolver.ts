import { Authorized, FieldResolver, Resolver, Mutation, ResolverInterface, Ctx, Arg, UseMiddleware, InputType, ObjectType, Field } from "type-graphql";
import { Service } from "typedi";
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
        const user = ctx.getSessionUser() as User;
        const course = ctx.state.course as Course;
        const userId = user.userId;
        const courseId = course.courseId;
        user.subscribedCourses?.push(course);
        course.subscribers?.push(user);
        this.userRepository.save(user);
        this.courseRepository.save(course);
        return { userId, courseId } as UserCourse;
    }

    @Authorized()
    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" })
    )
    @Mutation(() => UserCourse)
    async unsubscribeCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string): Promise<UserCourse> {
        const user = ctx.getSessionUser() as User;
        const course = ctx.state.course as Course;
        const userId = user.userId;
        const courseId = course.courseId;
        user.subscribedCourses = user.subscribedCourses?.filter(subscribeCourse => {
            subscribeCourse.courseId !== course.courseId; 
        });
        course.subscribers = course.subscribers?.filter(subcriber => {
            subcriber.userId !== user.userId;
        });
        await this.userRepository.save(user);
        await this.courseRepository.save(course);
        return { userId, courseId } as UserCourse;
    }
}