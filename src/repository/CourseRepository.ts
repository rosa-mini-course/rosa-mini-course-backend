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
        return course.lecturer;
    }

    async loadSubscribers(course: Course): Promise<User[] | undefined> {
        return course.subscribers;
    }

    async loadVideos(course: Course): Promise<Video[] | undefined> {
        return course.videos;
    }
}