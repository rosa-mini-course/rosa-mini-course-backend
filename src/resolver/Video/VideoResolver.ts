import { Resolver, FieldResolver, Query, ResolverInterface, Root, Authorized, UseMiddleware, Mutation, Ctx, Arg, ID } from "type-graphql";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Course, Video } from "../../entity";
import { VideoRepository } from "../../repository";
import { VideoService } from "../../service";
import { User } from "../../entity/User";
import { ContextCourseAccessible, LoadCourseIntoContext } from "../Course";
import { AppContext, AppUserContext } from "../../context";
import { GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";
import { UploadVideoInterface } from "../../type";
import { ApolloError } from "apollo-server-errors";
import { UploadVideoInput } from "../../type/Video/UploadVideoInput";
import { ContextVideoAccessible, LoadVideoIntoContext } from "./VideoGuard";
import { getCustomRepository } from "typeorm";

@Service()
@Resolver(() => Video)
export class VideoResolver implements ResolverInterface<Video> {
    @InjectRepository()
    private readonly videoRepository!: VideoRepository;

    @Inject()
    private readonly videoService!: VideoService;

    @FieldResolver(() => User)
    async VideoUploader(@Root() video: Video): Promise<User> {
        if (!video.uploader) {
            video.uploader = await this.videoRepository.loadUploader(video);
        }
        return video.uploader;
    }

    @FieldResolver(() => User)
    async belongToCourse(@Root() video: Video): Promise<Course> {
        if (!video.belongToCourse) {
            video.belongToCourse = await this.videoRepository.loadCourse(video);
        }
        return video.belongToCourse;
    }

//     // 参考教程 https://www.youtube.com/watch?v=s35EmAn9Zl8
//     @Authorized()
//     @UseMiddleware(
//         LoadCourseIntoContext({ argKey: "courseId", ctxKey: "course"}),
//         ContextCourseAccessible({ ctxKey: "course" })
//     )
//     @Mutation(() => Video)
//     async uploadVideo(
//         @Ctx() ctx: AppUserContext, 
//         @Arg("courseId") _courseId: string,
// /*      /*   @Arg("data") data: UploadVideoInput, */
//         @Arg("videofile", () => GraphQLUpload) { createReadStream, filename }: UploadVideoInterface
//     ): Promise<Video> {
//         const locationToSave: string = path.join(path.resolve(__dirname, '../..'), "VideoFiles");
//         const isUploadSuccess: Promise<boolean> = new Promise<boolean>(async (resolve, reject) => 
//             createReadStream()
//                 .pipe(createWriteStream(locationToSave))
//                 .on("finish", () => resolve(true))
//                 .on("error", () => reject(false))
//         );
//         if (!isUploadSuccess) throw new ApolloError("Video 文件上传失败");
//         let user = ctx.getSessionUser();
//         user = await getManager().findOneOrFail(User, { where: { userId: user?.userId }, relations: ["uploadedVideos"] });
//         let course = ctx.state.course as Course;
//         course = await getManager().findOneOrFail(Course, { where: { courseId: course.courseId }, relations: ["videos"]});
//         const video = this.videoRepository.create({ title: filename, uploader: user, belongToCourse: course, location: locationToSave });
//         return await this.videoRepository.save(video);
//     }

//     // TODO 播放视频
//     @Authorized()
//     @UseMiddleware(
//         LoadVideoIntoContext({ argKey: "videoId", ctxKey: "video"}),
//         ContextVideoAccessible({ ctxKey: "video" })
//     )
//     @Mutation(() => Video)
//     async displayVideo(
//         @Ctx() ctx: AppUserContext,
//         @Arg("videoId") videoId: string
//     ) {
//         if (getCustomRepository(VideoRepository).findById(videoId) === undefined) {
//             throw new ApolloError("视频ID有误");
//         }
//         const video: Video = getCustomRepository(VideoRepository).findById(videoId) as unknown as Video;
//         const url = video.location;
//     }



    @Authorized()
    @UseMiddleware(
        LoadVideoIntoContext({ argKey: "videoId", ctxKey: "video"}),
        ContextVideoAccessible({ ctxKey: "video" })
    )
    @Mutation(() => ID, { nullable: true })
    async removeVideo(@Ctx() ctx: AppUserContext, @Arg("videoId", () => ID) _videoId: string): Promise<string> {
        const video = ctx.state.video as Video;
        const videoId = video.videoId;
        await this.videoRepository.remove(video);
        return videoId;
    }
}
