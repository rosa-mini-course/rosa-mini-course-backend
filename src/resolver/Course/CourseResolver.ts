import { Arg, Authorized, Ctx, FieldResolver, ID, Mutation, Resolver, ResolverInterface, Root, UseMiddleware } from "type-graphql";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Course, Video } from "../../entity";
import { CourseRepository } from "../../repository";
import { UserService } from "../../service";
import { User } from "../../entity"
import { AddCourseInput } from "../../type/course/AddCourseInput";
import { AppUserContext } from "../../context";
import { UpdateCourseInput } from "../../type/course/UpdateCourseInput";
import { ContextCourseAccessible, LoadCourseIntoContext } from "./CourseGuard";


@Service()
@Resolver(() => Course)
export class CourseResolver implements ResolverInterface<Course> {
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
        async updateTeachingCourse(@Ctx() ctx: AppUserContext, @Arg("courseId") _courseId: string, @Arg("data" ) data: UpdateCourseInput): Promise<Course> {
            const course = ctx.state.course as Course;
            Object.assign(course, data);
            return this.courseRepository.save(course);
        }
        
        @Authorized()
        @UseMiddleware(
            LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course"}),
            ContextCourseAccessible({ ctxKey: "course" })
        )
        async removeTeachingCourse(@Ctx() ctx: AppUserContext, @Arg("courseId", () => ID) _courseId: string): Promise<string> {
            const course = ctx.state.course as Course;
            const courseId = course.courseId;
            await this.courseRepository.remove(course);
            return courseId;
        }
}