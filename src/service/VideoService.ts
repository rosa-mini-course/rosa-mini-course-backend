import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { videoRepository } from "../repository/VideoRepository";
import { Video } from "../entity/Video";
import { User } from "../entity/User";
import { CourseService } from "./CourseService";

@Service()
export class VideoService {
    @InjectRepository()
    private readonly videoRepository!: videoRepository;

    @Inject(() => CourseService)
    private readonly courseService!: CourseService;


    async accessibleBy(video: Video, user: User) {
        const course = video.course;
        const lecture = course.lecturer;
        if (lecture.userId === user.userId) {
            return true;
        }
        return false;
    }

}