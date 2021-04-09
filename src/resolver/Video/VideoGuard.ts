import { ApolloError } from "apollo-server-errors";
import { MiddlewareFn, ResolverData, NextFn } from "type-graphql";
import Container from "typedi";
import { getCustomRepository } from "typeorm";
import { runInNewContext } from "vm";
import { AppContext, AppUserContext } from "../../context";
import { User, Video } from "../../entity";
import { VideoRepository } from "../../repository";
import { VideoService } from "../../service";

type VideoGuardArgs = {
    argKey?: string,
    ctxKey?: string
}

export function LoadVideoIntoContext({ argKey = "videoId", ctxKey = "video" }: VideoGuardArgs): MiddlewareFn<AppContext> {
    return async({ context, args }: ResolverData<AppContext>, next: NextFn) => {
        const videoId = String(args[argKey]);
        const video = await getCustomRepository(VideoRepository).findOne({ videoId });
        if (!video) {
            throw new ApolloError("Video 不存在。");
        }

        context.state[ctxKey] = video;
        return next();
    };
}

export function ContextVideoAccessible({ ctxKey = "video" }: Omit<VideoGuardArgs, "argKey">): MiddlewareFn<AppUserContext> {
    return async ({ context }: ResolverData<AppUserContext>, next: NextFn) => {
        const user = context.getSessionUser() as User;
        const video = context.state[ctxKey] as Video;
        if (!(await Container.get(VideoService).accessibleBy(video, user))) {
            throw new ApolloError("Video 无法访问。");
        }

        return next();
    };
}
