import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Course } from "../entity/Course";
import { CourseRepository } from "../repository/CourseRepository";
import { User } from "../entity/User";

@Service()
export class CourseService {
    @InjectRepository()
    private readonly courseRepository!: CourseRepository;
    
    async accessibleBy(course: Course, user: User): Promise<boolean> {
        const lecturer = course.lecturer;
        if (lecturer.userId === user.userId) {
            return true;
        }
        return false;
    }
}
