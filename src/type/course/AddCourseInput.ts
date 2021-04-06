import { Field, InputType } from "type-graphql";
import { Course } from "../../entity";

@InputType()
export class AddCourseInput implements Partial<Course> {
    @Field()
    coursename!: string;
}