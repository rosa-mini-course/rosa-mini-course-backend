import { Service} from "typedi";
import { EntityManager, EntityRepository, Repository } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { User } from "../entity";
import { isEmail } from "class-validator"
import { Course } from "../entity/Course";
import { Video } from "../entity/Video";

@Service()
@EntityRepository(User)
export class UserRepository extends Repository<User> {
    @InjectManager()
    manager!: EntityManager;

    async findById(id: number): Promise<User | undefined> {
        return this.findOne({ userId: id });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        if (!email || !isEmail(email)) {
            return undefined;
        }
        return this.findOne({ useremail: email });
    }

    async loadTeachingCourses(user: User): Promise<Course[]> {
        if (!user.teachingCourses) {
            user.teachingCourses = await this.createQueryBuilder().relation(User, "teachingCourses").of(user).loadMany();
        }
        return user.teachingCourses;
    }

    async loadSubscribedCourses(user: User): Promise<Course[]> {
        if (!user.subscribedCourses) {
            user.subscribedCourses = await this.createQueryBuilder().relation(User, "subscribedCourses").of(user).loadMany();
        }
        return user.subscribedCourses;
    }

    async loadUploadedVideos(user: User): Promise<Video[]> {
        if (!user.uploadedVideos) {
            user.uploadedVideos = await this.createQueryBuilder().relation(User, "uploadedVideos").of(user).loadMany();
        }
        return user.uploadedVideos;
    }
}
