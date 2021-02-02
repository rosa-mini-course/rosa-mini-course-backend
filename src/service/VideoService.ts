import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { VideoRepository } from "../repository/VideoRepository";
import { Video } from "../entity/Video";
import { User } from "../entity/User";
import { CourseService } from "./CourseService";

@Service()
export class VideoService {
    @InjectRepository()
    private readonly videoRepository!: VideoRepository;

    @Inject(() => CourseService)
    private readonly courseService!: CourseService;

    async accessibleBy(video: Video, user: User) {
        const course = video.belongToCourse;
        const lecture = course.lecturer;
        if (lecture.userId === user.userId) {
            return true;
        }
        return false;
    }

}