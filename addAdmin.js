const { createConnection, getCustomRepository } = require('typeorm');
const repositories_1 = require("./dist/repositories");
const UserRepository = require('./dist/repositories/UserRepository');

(async () => {
    const [, , login, password] = process.argv;
    await createConnection();
    const userRepository = getCustomRepository(repositories_1.UserRepository);
    if (!login || !password) throw new Error('Додайте логин и пароль');
    try {
        await userRepository.addAdmin(login, password);
        console.log('Адмін доданий');
    } catch (error) {
        console.error(error);
    }
})();
