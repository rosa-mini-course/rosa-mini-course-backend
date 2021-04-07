import { Field, InputType } from "type-graphql";
import { Course } from "../../entity";

@InputType()
export class UpdateCourseInput implements Partial<Course> {
    @Field({ nullable: true })
    coursename?: string;

    @Field({ nullable: true })
    info?: string;
}