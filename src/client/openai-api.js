import { generatePetal, init, sepalGroup, UpdatePetalGroup, petalFunctionText } from './client';
import { changePetalColor, changeSepalColor } from './color';
import { OPENAI_API_KEY } from './OPENAI_API_KEY';
import { regexPosisionResponse } from './position';
const FormData = require("form-data");
const axios = require("axios");


export const openAiTranscription = async (data, type) => {

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
            if (type === "code") {
                document.getElementById('record-message').innerHTML = speechResult; // string
                // let prompt = "1. Use Three.js to write a 3D petal in an irregular shape. 2. Must starting with const shape = new THREE.Shape(); declare at least 4 curves... 3. Must use THREE.CubicBezierCurve() and THREE.ExtrudeGeometry(). 4. Must ending with shape.curves.push().  5. More requirements are below."
                // let prompt = "0.Provide me with a sample code shell that meets the requirements I listed, DO NOT OUTPUT ANYTHING EXCEPT CODE. 1. Use Three.js to draw a 3D petal's shape. 2. Must start with drawing the bottom of the petal. 3. Must have THREE.Shape(), shape.moveTo(0,0); shape.lineTo() no more than 6 times; ...4. All numbers in shape.lineTo() MUST be in the range of (-5,5); 4. the petal looks like a strawberry";
                let prompt = "0.Provide me with a sample code shell that meets the requirements I listed, DO NOT OUTPUT ANYTHING EXCEPT CODE. 1. Use Three.js to draw a 3D petal's shape. 2. Must start with drawing the bottom of the petal. 3. Must have THREE.Shape(), shape.moveTo(0,0); shape.lineTo() no more than 6 times; ...4. All numbers in shape.lineTo() MUST be in the range of (-5,5); 4.";
                openAiChat(prompt + speechResult);
            } else if (type === "color") {
                document.getElementById("record-message-color").innerHTML = speechResult;
                let prompt = "0.provide me the html css color based on the description. 1." + speechResult;
                openAiChat(prompt + speechResult, "color");
            } else if (type === "position") {
                document.getElementById("record-message-position").innerHTML = speechResult;
                let prompt = "tell a number in 0 to 1 as decimal based on my description: " + speechResult;
                openAiChat(prompt + speechResult, "position");
            }
           
        })
        .catch((error) => {
            console.error(error);
        });
}


export const openAiChat = async (data, type="code") => {
    const model = "gpt-3.5-turbo";
    const messages = [
        {
            "role": "user",
            "content": data,
        }
    ];
    const formData = {
        "model": model,
        "messages": messages,
    }
    console.log("this chat function has been called");
    axios
        .post("https://api.openai.com/v1/chat/completions", formData, {
            headers: {
                // KEY
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": `application/json`,
            },
        })
        .then((response) => {
            const responseChoices = response.data.choices[0].message.content;
            if (type === "code") {
                document.getElementById('respond-message').innerHTML = responseChoices;
                regexResponse(responseChoices);
                // const shapeTitle = document.getElementById("shape-title").innerText;
                // switch (shapeTitle) {
                //     case "Petal Shape Adjustment":
                //         regexResponse(responseChoices);
                //         break;
                //     case "Sepal Shape Adjustment":
                //         regexResponse(responseChoices);
                //         break;
                //     default:
                //         console.log(shapeTitle);
                // }
            } else if (type === "color") {
                document.getElementById('respond-message-color').innerHTML = responseChoices;
                // const pillIdentifier = document.getElementById("pills-tabContent").children[-1];
                // console.log(pillIdentifier);
                const colorTitle = document.getElementById("color-title").innerText;
                switch (colorTitle) {
                    case "Petal Color Adjustment":
                        changePetalColor(responseChoices);
                        break;
                    case "Sepal Color Adjustment":
                        changeSepalColor(responseChoices);
                        break;
                    default:
                        console.log(colorTitle);
                } 
            } else if (type === "position") {
                document.getElementById('respond-message-position').innerHTML = responseChoices;
                regexPosisionResponse(responseChoices);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

function regexResponse(response) {
    console.log(response);

    let result = "";
    const regexInit = /.*new THREE.Shape\(\);/g;
    // console.log(response.match(regexInit));
    result += response.match(regexInit) + "\n";
    const regexMoveTo = /.*hape.move.*/g;
    result += response.match(regexMoveTo) + "\n";
    const regexLineTo = /.*hape.line.*/g;
    const lineToResult = [...response.matchAll(regexLineTo)];
    lineToResult.forEach((ele) => {
        // console.log(ele[0]);
        result += ele[0] + "\n";
    });
    console.log("regex result ", result);

    // const fakeresponse = "var shape = new THREE.Shape();"+
    // "shape.moveTo(0, 0);"+
    // "shape.lineTo(-2, -3);"+
    // "shape.lineTo(-4, -2);"+
    // "shape.lineTo(-5, 0);"+
    // "shape.lineTo(-4, 2);"+
    // "shape.lineTo(-2, 3);"+
    // "shape.lineTo(0, 0);"
    changePoint(result);
}

function changePoint(newCode) {
    var functionText = petalFunctionText === "" ? generatePetal.toString() : petalFunctionText.toString();
    // console.log("before change", functionText);
    functionText = functionText.replaceAll(/three__WEBPACK_IMPORTED_MODULE_[0-9]__/g, "THREE");
    // Remove old code but has been updated already.
    functionText = functionText.replaceAll(/.*moveTo.*;/g, "");
    functionText = functionText.replaceAll(/.*lineTo.*;/g, "");
    // Remove original code
    functionText = functionText.replace("const curve1 = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(0, 0.5), new THREE.Vector2(-1, 1), new THREE.Vector2(-1, 2)); const curve2 = new THREE.CubicBezierCurve(new THREE.Vector2(-1, 2), new THREE.Vector2(-1, 3), new THREE.Vector2(-0.5, 4), new THREE.Vector2(0, 4)); const curve3 = new THREE.CubicBezierCurve(new THREE.Vector2(0, 4), new THREE.Vector2(0.5, 4), new THREE.Vector2(1, 3), new THREE.Vector2(1, 2)); const curve4 = new THREE.CubicBezierCurve(new THREE.Vector2(1, 2), new THREE.Vector2(1, 1), new THREE.Vector2(0, 0.5), new THREE.Vector2(0, 0)); shape.curves.push(curve1, curve2, curve3, curve4);", "");

    // Add new code, using THREE.Shape() as place identifier
    functionText = functionText.replace(/.*THREE.Shape.*;/g, newCode);
    // Name all pentalShape to shape
    functionText = functionText.replace(/[a-z]*[A-Z]*[Ss]hape\./g, "shape.");
    functionText = functionText.replace(/[a-z]*[A-Z]*[Ss]hape /g, "shape ");
    console.log("change point", functionText);
    
    functionText = new Function("handShape", functionText.substring(functionText.indexOf('{')+1, functionText.lastIndexOf('}')));
    const petalGroup = functionText("");
    
    UpdatePetalGroup(petalGroup, functionText);
    init(petalGroup, sepalGroup);
}

