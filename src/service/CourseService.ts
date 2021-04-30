import { Service } from "typedi";
import { InjectManager, InjectRepository } from "typeorm-typedi-extensions";
import { Course } from "../entity/Course";
import { CourseRepository } from "../repository/CourseRepository";
import { User } from "../entity/User";
import { getManager } from "typeorm";

@Service()
export class CourseService {

    @InjectRepository()
    private readonly courseRepository!: CourseRepository;
    
    async accessibleBy(course: Course, user: User): Promise<boolean> {
        const refresh_user = await getManager().findOneOrFail(User, { where: { userId: user.userId }}) as User;
        const refresh_course = await getManager().findOneOrFail(Course, { where: { courseId: course.courseId }, relations: ["lecturer"]});
        const lecturer = refresh_course.lecturer;
        if (lecturer.userId === refresh_user.userId) {
            return true;
        }
        return false;
    }
}
