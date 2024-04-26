const express = require("express");
const path = require("path");
const morgan = require('morgan');
const nunjucks = require("nunjucks");

const pageRouter = require("./routers/page");
const gameRouter = require("./routers/game");

const app = express();
app.set("port", process.env.PORT || 8080);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});

app.use("/", express.static(path.join(__dirname, "public")));
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", pageRouter);
app.use("/game", gameRouter);

app.listen(app.get("port"), () => {
    console.log(`${app.get("port")}번 포트에서 대기 중`);
});