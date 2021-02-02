import { Service } from "typedi";
import { EntityManager, EntityRepository, Repository } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { Course } from "../entity/Course";
import { Video } from "../entity/Video";
import { User } from "../entity/User";

@Service()
@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {
    @InjectManager()
    manager!: EntityManager;

    async findById(uuid: string): Promise<Course | undefined> {
        return this.findOne({ courseId: uuid });
    }

    async findByName(name: string): Promise<Course | undefined> {
        return this.findOne({ coursename: name});
    }

    async loadLecturer(course: Course): Promise<User> {
        if (!course.lecturer) {
            course.lecturer = (await this.createQueryBuilder().relation(Course, "lecturer").of(course).loadOne()) as User;
        }
        return course.lecturer;
    }

    async loadSubscribers(course: Course): Promise<User[]> {
        if (!course.subscribers) {
            course.subscribers = await this.createQueryBuilder().relation(Course, "subscribers").of(course).loadMany();
        }
        return course.subscribers;
    }

    async loadVideos(course: Course): Promise<Video[]> {
        if (!course.videos) {
            course.videos = await this.createQueryBuilder().relation(Course, "videos").of(course).loadMany();
        }
        return course.videos;
    }
}