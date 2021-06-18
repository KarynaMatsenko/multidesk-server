import { Middleware } from '@decorators/express';
import bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';

export default class BodyParserMiddleware implements Middleware {
    public async use(req: Request, res: Response, next: NextFunction): Promise<any> {
        const parser = bodyParser.json();
        parser(req, res, next);
    }
}