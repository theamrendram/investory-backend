const app = require("../app");
const request = require("supertest");

describe("testing user routes", () => {
    // testing add user function
    test("adding user with correct data", async ()=> {
        const response = await request(app)
          .post("/api/users")
          .send({
            name: "test",
            email: "testing" + Math.floor(Math.random() * 1000) + "@gmail.com",
            phone: "1234567890",
          });
          console.log(response);
        expect(response.statusCode).toBe(201);
    })
    test("adding user without email", async ()=> {
        const response = await request(app).post("/api/users").send({
            name: "test",
            phone: "1234567890"
        })
        expect(response.statusCode).toBe(500);
    })
    test("adding user without email - code 201", async () => {
      const response1 = await request(app).post("/api/users").send({
        name: "test",
        phone: "1234567890",
        email: "test1@ananya.jain"
      });

      const response2 = await request(app).post("/api/users").send({
        name: "test",
        phone: "1234567890",
        email: "test1@ananya.jain"
      });

      expect(response2.statusCode).toBe(500);
    });
})