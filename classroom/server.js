const express = require("express");
const app = express();
const users =  require("./routes/user.js");
const posts =  require("./routes/post.js");
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.get("/greet", (req, res) => {
    let { name = "Anonymous" } = res.cookies;
    res.send(`Hi, ${name}`);
});

app.get("/", (req, res) => {
    console.dir(req.cookies);
    res.send("Hi, I am route");
});

app.use(cookieParser("secretcode"));
app.get("/getsignedcookies", (req, res) => {
    response.cookie("made-in", "India", {signed: true});
    res.send("signed cookie sent");
});

app.get("/verify", (req, res) => {
    console.log(req.cookies);
       console.log(req.signedCookies); 
    res.send("verify");
});

app.get("/setCookies", (req, res) => {
    res.cookie("greee", "namaste");
    res.cookie("origin", "India");
    res.send("We send you a cookie");
})

//for user-route
app.use("/users", users);
//for post-route
app.use("/posts", posts);

app.listen(3000, () => {
    console.log("Server is listening t0 3000");
});