import { Service } from "typedi";
import { EntityManager, EntityRepository, Repository } from "typeorm";
import { Video } from "../entity/Video";
import { User } from "../entity/User";
import { Course } from "../entity";
import { InjectManager } from "typeorm-typedi-extensions";

@Service()
@EntityRepository(Video)
export class VideoRepository extends Repository<Video> {
    @InjectManager()
    manager!: EntityManager;

    async findById(uuid: string): Promise<Video | undefined> {
        return this.findOne({ videoId: uuid });
    }

    async findByTitle(title: string): Promise<Video | undefined> {
        return this.findOne({ title });
    }

    async loadUploader(video: Video): Promise<User> {
        if (!video.uploader) {
            video.uploader = (await this.createQueryBuilder().relation(Video, "uploader").of(video).loadOne()) as User;
        }
        return video.uploader;
    }

    async loadCourse(video: Video): Promise<Course> {
        if (!video.belongToCourse) {
            video.belongToCourse = (await this.createQueryBuilder().relation(Video, "belongToCourse").of(video).loadOne()) as Course;
        }
        return video.belongToCourse;
    }
}