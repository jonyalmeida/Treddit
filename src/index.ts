import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";

const main = async () => {
    const orm = await MikroORM.init({
        entities: [],
        dbName: 'treddit_db',
        user: 'treddit_app',
        password: '12345',
        debug: !__prod__,
        type: 'postgresql'
    });
};

main();
