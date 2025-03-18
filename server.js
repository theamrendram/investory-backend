const app = require("./src/app");

const axios = require("axios");

// function getLogin(){

//   let config = {
//     method: "get",
//     maxBodyLength: Infinity,
//     url: "https://api.upstox.com/v2/login/authorization/dialog?client_id=e3c447c9-db1b-4533-9976-afdf411503d6&redirect_uri=https://localhost:3000",
//     headers: {},
//   };

//   axios(config)
//     .then((response) => {
//       console.log(JSON.stringify(response.data));
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }
// getLogin()
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
