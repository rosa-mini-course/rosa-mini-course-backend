import { Arg, Authorized, Ctx, Field, FieldResolver, ID, Mutation, ObjectType, Query, Resolver, ResolverInterface, Root, UseMiddleware } from "type-graphql";
import { Inject, Service } from "typedi";
import { InjectManager, InjectRepository } from "typeorm-typedi-extensions";
import { Course, Video } from "../../entity";
import { CourseRepository } from "../../repository";
import { User } from "../../entity"
import { AppUserContext } from "../../context";
import { ContextCourseAccessible, LoadCourseIntoContext } from "./CourseGuard";
import { AddCourseInput, UpdateCourseInput } from "../../type/Course";
import { EntityManager, getConnection, getManager, In, Not } from "typeorm";
import { ApolloError } from "apollo-server-errors";


@ObjectType()
class CourseId {
    @Field()
    courseId!: string;
}


@Service()
@Resolver(() => Course)
export class CourseResolver implements ResolverInterface<Course> {
    @InjectManager()
    manager!:EntityManager

    @InjectRepository()
    private readonly courseRepository!: CourseRepository;

    @FieldResolver()
    async lecturer(@Root() course: Course): Promise<User> {
        return this.courseRepository.loadLecturer(course);
    }

    @FieldResolver(() => [Video])
    async videos(@Root() course: Course): Promise<Video[]> {
        return this.courseRepository.loadVideos(course);
    }

    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" }),
    )
    @Query(() => [Video])
    async loadVideos(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string): Promise<Video[] | undefined> {
        let course = ctx.state.course as Course;
        course = await getManager().findOneOrFail(Course, { where: { courseId: course.courseId}, relations: ["videos"] });
        return course.videos;
    }


    @Query(() => [Course])
    async discoveryCourses(
        @Ctx() ctx: AppUserContext
    ): Promise<Course[]> {
        const sql_sentence = "select \"courseId\", \"coursename\", \"info\" from public.\"course\"";
        let user = ctx.getSessionUser();
        if (!user) {
            return this.manager.find(Course)
        }
        user = await this.manager.findOne(User, { relations: ["subscribedCourses"], where:{userId: user?.userId}})
        const subscribedCourses = user?.subscribedCourses as Course[]
        const unsubscribedCourse = this.manager.find(Course, {where: { courseId: Not(In(subscribedCourses?.map(course=>course.courseId)))}})
        return unsubscribedCourse;
    }

    @Authorized()
    @Mutation(() => Course)
    async addTeachingCourse(@Ctx() ctx: AppUserContext, @Arg("data") data: AddCourseInput): Promise<Course> {
        const user = ctx.getSessionUser();
        const course = this.courseRepository.create({ lecturer: user, ...data });
        return this.courseRepository.save(course);
    }

    @Authorized()
    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" }),
        ContextCourseAccessible({ ctxKey: "course" })
    )
    @Mutation(() => Course)
    async updateTeachingCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string, @Arg("data") data: UpdateCourseInput): Promise<Course> {
        const course = ctx.state.course as Course;
        Object.assign(course, data);
        return this.courseRepository.save(course);
    }

    @Authorized()
    @UseMiddleware(
        LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course" }),
        ContextCourseAccessible({ ctxKey: "course" })
    )
    @Mutation(() => CourseId)
    async removeTeachingCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string): Promise<CourseId> {
        let course = ctx.state.course as Course;
        const courseId = course.courseId
        course = await getManager().findOneOrFail(Course, { where: { courseId: course.courseId}, relations: ["lecturer", "videos"] });
        if (course.videos?.length !== 0) {
            throw new ApolloError("该课程含有资源文件，请先删除资源文件");
        }
        await this.courseRepository.remove(course);
        return { courseId: courseId } as CourseId;
    }
}