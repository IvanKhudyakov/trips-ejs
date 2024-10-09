const { app } = require("../app");
// const { testUserPassword, factory, seed_db } = require("../utils/seed_db");
// const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../utils/get_chai");
// const User = require("../models/User");
// const Trip = require("../models/Trip");

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

describe("tests for CRUD operations", function () {
    before(async () => {

        const { expect, request } = await get_chai();
        this.testUser = await seed_db();
        let req = request.execute(app).get("/sessions/logon").send();
        let res = await req;
        const textNoLineEnd = res.text.replaceAll("\n", "");
        this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
        let cookies = res.headers["set-cookie"];
        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken=s%3A" + this.csrfToken),
        );
        const dataToPost = {
            email: this.testUser.email,
            password: testUserPassword,
            _csrf: this.csrfToken,
        };
        req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0)
            .send(dataToPost);
        res = await req;
        cookies = res.headers["set-cookie"];
        this.sessionCookie = cookies.find((element) =>
            element.startsWith("connect.sid"),
        );
        expect(this.csrfToken).to.not.be.undefined;
        expect(this.sessionCookie).to.not.be.undefined;
        expect(this.csrfCookie).to.not.be.undefined;
    });

    it("should get all trips", async () => {
        const { expect, request } = await get_chai();
        let req = request
            .execute(app)
            .get("/trips")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .set("content-type", "application/x-www-form-urlencoded")
            .send();
        let res = await req;

        const pageParts = res.text.split("<tr>");
        expect(pageParts.length).to.equal(21);

    });
    it("should create a trip", async () => {
        const { expect, request } = await get_chai();

        const dataToPost = {
            destination: "Pinsk",
            startDate: "2025-01-02",
            duration: "7",
            reason: "business",
            _csrf: this.csrfToken,
        }

        let req = request
            .execute(app)
            .post("/trips")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .set("content-type", "application/x-www-form-urlencoded")
            .send(dataToPost);
        let res = await req;
        expect(res).to.have.status(200);
        const pageParts = res.text.split("<tr>");
        expect(pageParts.length).to.equal(22);
        expect(res.text).to.include("Pinsk");
        


    });
    it("should get existing trip by id", async () => {
        const { expect, request } = await get_chai();

    });
    it("should update existing trip", async () => {
        const { expect, request } = await get_chai();

    });
    it("should delete existing trip", async () => {
        const { expect, request } = await get_chai();

    });
    // it("", async () => {
    //     const { expect, request } = await get_chai();

    // });
})