import { OPENAI_API_KEY } from './OPENAI_API_KEY';
const FormData = require("form-data");
const axios = require("axios");


export const openAiTranscription = async (data) => {

    const model = "whisper-1";
    const mp3File = new File([data], 'record.mp3');
    const formData = new FormData();
    formData.append("model", model);
    formData.append("file", mp3File);
    axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: {
                //KEY
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            },
        })
        .then((response) => {
            console.log(response.data);
            const speechResult = response.data.text;
            document.getElementById('record-message').innerHTML = speechResult;//string
            // openAiChat(speechResult);
            let prompt = "1. Use Three.js to write a 3D petal in an irregular shape. 2. Must starting with const shape = new THREE.Shape(); declare at least 4 curves... 3. Must use THREE.CubicBezierCurve() and THREE.ExtrudeGeometry(). 4. Must ending with shape.curves.push().  5. More requirements are below."
            // let prompt ="draw a petal's shape with Three.js"
            openAiChat(prompt + speechResult);
            // let prompt ="draw a petal's shape with Three.js"
            // openAiChat(prompt);
            //document.getElementById('textToCode').innerHTML = "<button>This is a new button</button>";
        })
        .catch((error) => {
            console.error(error);
        });
}


export const openAiChat = async (data) => {
    const model = "gpt-3.5-turbo";
    // const usage = [{
    //     "prompt_tokens": 13,
    //     "completion_tokens": 7,
    //     "total_tokens": 20
    // }];
    const messages = [
        {
            "role": "user",
            "content": data,
        }
    ];
    const formData = {
        "model": model,
        "messages": messages,
        "stop": "4",
        "max_tokens":2000,
    }
    console.log("this chat function has been called");
    axios
        .post("https://api.openai.com/v1/chat/completions", formData, {
            headers: {
                //KEY
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": `application/json`,
            },
        })
        .then((response) => {
            console.log("response",response);
            const responseChoices = response.data.choices[0].message.content;
            console.log(responseChoices);
            document.getElementById('respond-message').innerHTML = responseChoices;
            //document.getElementById('textToCode').innerHTML = "<button>This is a new button</button>";
        })
        .catch((error) => {
            console.error(error);
            // console.log(error.)
        });
}

