import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

const main = async () => {
    //connect to database
    const orm = await MikroORM.init(mikroConfig);
    //run migrations
    await orm.getMigrator().up();

    //create express app
    const app = express();
    app.get("/", (req, res) => res.send("hello world"));

    app.listen(8081, () => console.log("Listening on port 8081..."));
};

main().catch((err) => console.log(err));
