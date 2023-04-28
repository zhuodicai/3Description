const FormData = require("form-data");
const axios = require("axios");
const openaiApi = require("./openai-api.js");

export const recordDef = () => {

    let audioChunks = {};
    let rec;

    navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {handlerFunction(stream)})

    function handlerFunction(stream) {
        rec = new MediaRecorder(stream);
        rec.ondataavailable = e => {
            audioChunks.data.push(e.data);
            if (rec.state == "inactive") {
                let blob = new Blob(audioChunks.data,{type:'audio/mpeg-3'});
                recordedAudio.src = URL.createObjectURL(blob);
                recordedAudio.controls = true;
                recordedAudio.autoplay = true;
                openaiApi.openAiTranscription(blob, audioChunks.type);
            }
        }
    }
      
    record.onclick = e => {
        record.disabled = true;
        stopRecord.disabled = false;
        audioChunks = {
            data: [],
            type: "code"
        };
        rec.start();
    }

    stopRecord.onclick = e => {
        record.disabled = false;
        stopRecord.disabled = true;
        rec.stop();
    }

    recordColor.onclick = e => {
        recordColor.disabled = true;
        stopRecordColor.disabled = false;
        audioChunks = {
            data: [],
            type: "color"
        };
        rec.start();
    }

    stopRecordColor.onclick = e => {
        recordColor.disabled = false;
        stopRecordColor.disabled = true;
        rec.stop();
    }

}