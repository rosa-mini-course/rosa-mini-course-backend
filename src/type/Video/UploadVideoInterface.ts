import { Stream } from "stream";
import { Field, ObjectType } from "type-graphql";

export interface UploadVideoInterface {

    filename: string;

    mimetype: string;

    encoding: string;

    createReadStream: () => Stream;
}
