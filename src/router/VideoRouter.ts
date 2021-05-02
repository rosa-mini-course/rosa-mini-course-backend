import path from "path"
import fs from "fs"
import Router from "koa-router"
import multer from "@koa/multer"



const dist_dir = path.join(path.resolve(__dirname, '../..'), "VideoFiles");
const multerInstance = multer({ dest: dist_dir });

export const videoRouter = new Router();


videoRouter.post('/upload', multerInstance.single('file'), async (ctx, next) => {
    const file = ctx.request.file
    fs.renameSync(file.path, path.resolve(dist_dir, file.originalname));
    file.path = path.resolve(dist_dir, file.originalname);
    console.log('ctx.request.file', ctx.request.file);
    console.log('ctx.file', ctx.file);
    console.log('ctx.request.body', ctx.request.body);
    console.log(file.path)
    ctx.body = ctx.request.file
});

videoRouter.get('/download/:name', async (ctx, next) => {
    const name = ctx.params.name
    console.log(dist_dir, name);
    const filepath = path.resolve(dist_dir, name);
    ctx.attachment(filepath);
    ctx.body = fs.createReadStream(filepath)
})
