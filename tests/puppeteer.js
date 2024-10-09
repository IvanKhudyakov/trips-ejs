const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Trip = require("../models/Trip");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);
        //await sleeper(5000)
        browser = await puppeteer.launch();
        // browser = await puppeteer.launch({headless: false, slowMo: 100});
        page = await browser.newPage();
        await page.goto("http://localhost:3000");
    });
    after(async function () {
        this.timeout(5000);
        await browser.close();
    });
    describe("got to site", function () {
        it("should have completed a connection", async function () { });
    });
    describe("index page test", function () {
        this.timeout(10000);
        it("finds the index page logon link", async () => {
            this.logonLink = await page.waitForSelector(
                "a ::-p-text(Click this link to logon)",
            );
        });
        it("gets to the logon page", async () => {
            await this.logonLink.click();
            await page.waitForNavigation();
            const email = await page.waitForSelector('input[name="email"]');
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all the fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');
            this.password = await page.waitForSelector('input[name="password"]');
            this.submit = await page.waitForSelector("button ::-p-text(Logon)");
        });
        it("sends the logon", async () => {
            testUser = await seed_db();
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);
            await this.submit.click();
            await page.waitForNavigation();
            await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
            await page.waitForSelector('a[href="/trips/new"]');
            const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            const copyrText = await copyr.evaluate((el) => el.textContent);
            console.log("copyright text: ", copyrText);
        });
    });
    describe("puppeteer job operations", function () {
        this.timeout(20000);
        // (test1) Make the test do a click on the link for the jobs list. Verify that the job listings page comes up, and that there are 20 entries in that list. 
        // A hint here: page.content() can be used to get the entire HTML page, and you can use the split() function on that to find the <tr>entries.
        it("test1", async () => {
            const pageSourceHTML = await page.content();
            const tripsList = pageSourceHTML.split("<tr>");
            if (typeof (tripsList) !== 'undefined') {
                const tripCount = await page.evaluate((list) => {
                    return list.length === 21
                }, tripsList);

                console.log(tripCount);
            }
            await page.click('button[name="edit-trip"]');
            await page.waitForNavigation();
            await page.waitForSelector('button[name="update-add"]');
            await page.click('button[id="edit-cancel"]');
            
        });
        
        // Have the test click on the "Add A Job" button and to wait for the form to come up. 
        // Verify that it is the expected form, and resolve the company and position fields and add button.
        it("test2", async () => {
            await page.click('a[href="/trips/new"]');
            await page.waitForSelector('input[name="destination"]');
            await page.waitForSelector('input[name="startDate"]');
            await page.waitForSelector('input[name="duration"]');
            await page.waitForSelector('select[name="reason"]');
            await page.waitForSelector('button[name="update-add"]');
        });

        // Type some values into the company and position fields. Then click on the add button. 
        // Wait for the jobs list to come back up, and verify that the message says that the job listing has been added. 
        // Check the database to see that the latest jobs entry has the data entered. You also use Job.find() as in the previous exercise.)
        it("test3", async () => {
            this.destination = await page.waitForSelector('input[name="destination"]');
            this.startDate = await page.waitForSelector('input[name="startDate"]');
            this.duration = await page.waitForSelector('input[name="duration"]');
            this.reason = await page.waitForSelector('select[name="reason"]');
            await this.destination.type('Brest');
            await this.startDate.type('12/12/2024');
            await this.duration.type('3');
            await this.reason.select('leasure');

            await page.click('button[name="update-add"]');
            await page.waitForNavigation();
            await page.waitForSelector('table[id="trips-table"]');
            await page.waitForSelector('button[name="edit-trip"]');

            const createdTrip = await Trip.findOne({destination: 'Brest'}).sort({createdAt:1});
            console.log(createdTrip);
            
        });
    })
});
