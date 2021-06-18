import { Inject, Injectable } from "@decorators/di";
import { Controller, Response as Res, Request as Req, Post, Get, Delete, Body } from "@decorators/express";
import { Response, Request } from "express";
import { USER_REPOSITORY } from "../../injectors";
import { AdminAuthMiddleware, BodyParserMiddleware } from "../../middleware";
import { UserRepository } from "../../repositories";
import { IGetUsersResponse, IPostUserRequest, IPostUserResponse } from "../../types";
import { TypeGuards } from "../../utils";

@Injectable()
@Controller('/admin', [BodyParserMiddleware, AdminAuthMiddleware])
export default class AdminController {

    public constructor(@Inject(USER_REPOSITORY) private _userRepository: UserRepository) {}

    @Get('/users')
    public async getUsers(@Res() res: Response): Promise<void> {
        const users = await this._userRepository.getAllUsers();
        const getUsersResponse: IGetUsersResponse = { users };
        res.send(getUsersResponse);
    }

    @Post('/user')
    public async addUser(@Req() req: Request, @Res() res: Response) {
        if (!TypeGuards.isPostUserRequest(req.body)) return res.sendStatus(400);
        const newUser = await this._userRepository.saveUser(req.body);
        if (!newUser) return res.sendStatus(409);
        const postUserResponse: IPostUserResponse = { user: newUser };
        res.send(postUserResponse);
    }

    @Delete('/user')
    public async deleteUser(@Body('id') id: number | undefined, @Res() res: Response) {
        if (!id) return res.sendStatus(400);
        await this._userRepository.delete({ id });
        res.sendStatus(200);
    }
}