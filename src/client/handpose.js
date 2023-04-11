import vision from "../../node_modules/@mediapipe/tasks-vision/vision_bundle.js";
const { HandLandmarker, FilesetResolver } = vision;

const demosSection = document.getElementById("demos");


export const handpose = () => {
    let handLandmarker = undefined;
    let runningMode = "IMAGE";
    // let enableWebcamButton: HTMLButtonElement;
    // let webcamRunning: Boolean = false;
    let enableWebcamButton;
    let webcamRunning = false;
    const videoHeight = "360px";
    const videoWidth = "480px";

    // Before we can use HandLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    async function runDemo() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task`
            },
            runningMode: runningMode,
            numHands: 2
        });
        // demosSection.classList.remove("invisible");
    }
    runDemo();

    /********************************************************************
    // Demo 2: Continuously grab image from webcam stream and detect it.
    ********************************************************************/

    const video = document.getElementById("webcam");
    const canvasElement = document.getElementById("output_canvas");
    const canvasCtx = canvasElement.getContext("2d");

    // Check if webcam access is supported.
    function hasGetUserMedia() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (hasGetUserMedia()) {
        enableWebcamButton = document.getElementById("webcamButton");
        enableWebcamButton.addEventListener("click", enableCam);
    } else {
        console.warn("getUserMedia() is not supported by your browser");
    }

    // Enable the live webcam view and start detection.
    function enableCam(event) {
        if (!handLandmarker) {
            console.log("Wait! objectDetector not loaded yet.");
            return;
        }

        if (webcamRunning === true) {
            webcamRunning = false;
            enableWebcamButton.innerText = "ENABLE PREDICTIONS";
        } else {
            console.log("webcam was off");
            webcamRunning = true;
            enableWebcamButton.innerText = "DISABLE PREDICITONS";
        }

        // getUsermedia parameters.
        const constraints = {
            video: true
        };

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            video.srcObject = stream;
            video.addEventListener("loadeddata", predictWebcam);
        });
    }

    async function predictWebcam() {
        canvasElement.style.height = videoHeight;
        video.style.height = videoHeight;
        canvasElement.style.width = videoWidth;
        video.style.width = videoWidth;
        // Now let's start detecting the stream.
        if (runningMode === "IMAGE") {
            runningMode = "VIDEO";
            await handLandmarker.setOptions({ runningMode: runningMode });
        }
        let nowInMs = Date.now();
        const results = handLandmarker.detectForVideo(video, nowInMs);

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.landmarks) {
            for (const landmarks of results.landmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 5
                });
                drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
            }
        }
        canvasCtx.restore();

        // Call this function again to keep predicting when the browser is ready.
        if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }
    }
}
