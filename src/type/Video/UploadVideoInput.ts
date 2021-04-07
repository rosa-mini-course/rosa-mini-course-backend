import { Field, InputType } from "type-graphql";
import { Video } from "../../entity";

@InputType()
export class UploadVideoInput implements Partial<Video> {
    @Field()
    title!: string;

    @Field()
    info?: string;
}