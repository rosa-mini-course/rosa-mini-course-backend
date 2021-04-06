import { Resolver, FieldResolver, Query, ResolverInterface, Root } from "type-graphql";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Course, Video } from "../../entity";
import { VideoRepository } from "../../repository";
import { VideoService } from "../../service";
import { User } from "../../entity/User";

@Service()
@Resolver(() => Video)
export class VideoResolver implements ResolverInterface<Video> {
    @InjectRepository()
    private readonly videoRepository!: VideoRepository;

    @Inject()
    private readonly videoService!: VideoService;

    @FieldResolver(() => User)
    async uploader(@Root() video: Video): Promise<User> {
        if (!video.uploader) {
            video.uploader = await this.videoRepository.loadUploader(video);
        }
        return video.uploader;
    }

    @FieldResolver(() => User)
    async course(@Root() video: Video): Promise<Course> {
        if (!video.belongToCourse) {
            video.belongToCourse = await this.videoRepository.loadCourse(video);
        }
        return video.belongToCourse;
    }
}