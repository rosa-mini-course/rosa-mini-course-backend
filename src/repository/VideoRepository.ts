import { Service } from "typedi";
import { EntityRepository, Repository } from "typeorm";
import { Video } from "../entity/Video";

@Service()
@EntityRepository(Video)
export class videoRepository extends Repository<Video> {
    
}