import { Service} from "typedi";
import { EntityManager, EntityRepository, Repository } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { User } from "../entity";
import { isEmail } from "class-validator"
import { Course } from "../entity/Course";

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

    async loadTeachingCourses(user: User): Promise<Course[] | undefined> {
        return user.teachingCourse;
    }

    async loadSubscribedCourses(user: User): Promise<Course[] | undefined> {
        return user.subscribedCourses;
    }
}
