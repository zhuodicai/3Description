const dotenv = require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const filePath = path.join(__dirname, "./asset/audio/Wandering_Star.mp3");
const model = "whisper-1";

const formData = new FormData();
formData.append("model", model);
formData.append("file", fs.createReadStream(filePath));

let speechResult;



axios
.post("https://api.openai.com/v1/audio/transcriptions", formData, {
    headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
    },
})
.then((response) => {
    console.log(response.data);
    speechResult = response.data;
    document.getElementById('speechResult').innerHTML = speechResult;
})
.catch((error) => {
    console.error(error);
});


// export const createButton = () => {
//     document.getElementById('toGetButton').innerHTML = "<button>Test</button>";
// }