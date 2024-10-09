const { app } = require("../app");
// const { testUserPassword, factory, seed_db } = require("../utils/seed_db");
// const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../utils/get_chai");
// const User = require("../models/User");


// =============
// =============
// =============
const Trip = require("../models/Trip");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();

const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);
factory.define("trip", Trip, {
    destination: () => faker.location.city(),
    startDate: () => faker.date.future(),
    duration: () => faker.number.int({ min: 3, max: 15 }),
    reason: () =>
        ["business", "leasure"][Math.floor(2 * Math.random())], // random one of these
});
factory.define("user", User, {
    name: () => faker.person.fullName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password(),
});

const seed_db = async () => {
    let testUser = null;
    try {
        const mongoURL = process.env.MONGO_URI_TEST;
        await Trip.deleteMany({}); // deletes all job records
        await User.deleteMany({}); // and all the users
        testUser = await factory.create("user", { password: testUserPassword });
        await factory.createMany("trip", 20, { createdBy: testUser._id }); // put 30 job entries in the database.
    } catch (e) {
        console.log("database error");
        console.log(e.message);
        throw e;
    }
    return testUser;
};



// =============
// =============
// =============


describe("tests for registration and logon", function () {
    // after(() => {
    //   server.close();
    // });
    it("should get the registration page", async () => {
        const { expect, request } = await get_chai();
        const req = request.execute(app).get("/sessions/register").send();
        const res = await req;
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replaceAll("\n", "");
        const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        //console.log("Response cookies:", cookies); // for some reason there are 2 csrf tokens :\
        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken=s%3A" + this.csrfToken),
        );

        expect(this.csrfCookie).to.not.be.undefined;
    });

    it("should register the user", async () => {
        const { expect, request } = await get_chai();
        this.password = faker.internet.password();
        this.user = await factory.build("user", { password: this.password });
        const dataToPost = {
            name: this.user.name,
            email: this.user.email,
            password: this.password,
            password1: this.password,
            _csrf: this.csrfToken,
        };

        const req = request
            .execute(app)
            .post("/sessions/register")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost);
        const res = await req;

        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Trips List");
        newUser = await User.findOne({ email: this.user.email });
        expect(newUser).to.not.be.null;
    });



    it("should log the user on", async () => {
        const dataToPost = {
            email: this.user.email,
            password: this.password,
            _csrf: this.csrfToken,
        };
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0)
            .send(dataToPost);
        const res = await req;
        expect(res).to.have.status(302);
        expect(res.headers.location).to.equal("/");
        const cookies = res.headers["set-cookie"];
        this.sessionCookie = cookies.find((element) =>
            element.startsWith("connect.sid"),
        );
        expect(this.sessionCookie).to.not.be.undefined;
    });

    it("should get the index page", async () => {
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .get("/")
            .set("Cookie", this.csrfCookie)
            .set("Cookie", this.sessionCookie)
            .send();
        const res = await req;
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include(this.user.name);
    });

    it("should log the user off", async () => {
        const dataToPost = {
            _csrf: this.csrfToken,
        };
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .post("/sessions/logoff")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            // .set("Cookie", this.sessionCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            // .redirects(0)
            .send(dataToPost);
        const res = await req;
        expect(res).to.have.status(200);
        const cookies = res.headers["set-cookie"];
        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken=s%3A" + this.csrfToken),
        );

        expect(this.csrfCookie).to.be.undefined;
        expect(res.text).to.include("link to logon");
    });
});