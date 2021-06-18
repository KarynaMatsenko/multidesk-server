import { Inject, Injectable } from "@decorators/di";
import { Controller, Response as Res, Request as Req, Post, Body } from "@decorators/express";
import { Request, Response } from "express";
import { USER_REPOSITORY } from "../../injectors";
import { BodyParserMiddleware } from "../../middleware";
import { UserRepository } from "../../repositories";
import { IPostLoginResponse, IPostUserRequest, Role } from "../../types";
import { JWT, TypeGuards } from "../../utils";

@Injectable()
@Controller('/login', [BodyParserMiddleware])
export default class LoginController {
    public constructor(@Inject(USER_REPOSITORY) private _userRepository: UserRepository) {}

    @Post('/checkToken')
    public async checkToken(@Body('token') token: string | undefined, @Res() res: Response) {
        if (!token) return res.sendStatus(400);
        const decoded = JWT.decode(token);
        if (!decoded) return res.sendStatus(403);
        res.sendStatus(200);
    }

    @Post('/admin')
    public async loginAdmin(@Req() req: Request, @Res() res: Response) {
        this._loginUser(req.body, res, Role.Admin);
    }

    @Post('/user')
    public async loginUser(@Req() req: Request, @Res() res: Response) {
        this._loginUser(req.body, res, Role.User);
    }

    private async _loginUser(user: Partial<IPostUserRequest> | undefined, res: Response, role: Role) {
        if (!TypeGuards.isPostUserRequest(user)) return res.sendStatus(400);
        const userData = await this._userRepository.getUserByCredentials(user);
        if (!userData) return res.sendStatus(401);
        if (userData.role !== role) return res.sendStatus(403);
        const postLoginResponse: IPostLoginResponse = { token: JWT.create({ userId: userData.id }) };
        res.send(postLoginResponse);
    }
}