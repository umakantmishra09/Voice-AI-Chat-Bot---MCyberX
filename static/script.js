const voiceButton = document.getElementById("voiceButton");
const status = document.getElementById("status");

const userText = document.getElementById("userText");
const aiText = document.getElementById("aiText");

const textButton = document.getElementById("textButton");
const textBox = document.getElementById("textBox");

const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");

const settingsButton = document.getElementById("settingsButton");
const settingsBox = document.getElementById("settingsBox");
const closeSettings = document.getElementById("closeSettings");


/* ============================= */
/*        VOICE VARIABLES        */
/* ============================= */

let listening = false;

let mediaRecorder;

let audioChunks = [];


/* ============================= */
/*        VOICE BUTTON           */
/* ============================= */

voiceButton.addEventListener("click", async function () {

    /* ============================= */
    /*        START RECORDING         */
    /* ============================= */

    if (listening === false) {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });


            mediaRecorder =
                new MediaRecorder(stream);


            audioChunks = [];


            /* ============================= */
            /*      COLLECT AUDIO DATA        */
            /* ============================= */

            mediaRecorder.ondataavailable =
                function (event) {

                    if (event.data.size > 0) {

                        audioChunks.push(event.data);

                    }

                };


            /* ============================= */
            /*       RECORDING STOPPED       */
            /* ============================= */

            mediaRecorder.onstop =
                async function () {

                    /* ============================= */
                    /*      CREATE AUDIO FILE        */
                    /* ============================= */

                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type: "audio/webm"
                            }
                        );


                    const formData =
                        new FormData();


                    formData.append(
                        "audio",
                        audioBlob,
                        "voice.webm"
                    );


                    try {

                        /* ============================= */
                        /*      SEND TO WHISPER           */
                        /* ============================= */

                        status.innerHTML =
                            "Transcribing...";


                        const voiceResponse =
                            await fetch(
                                "/voice",
                                {
                                    method: "POST",
                                    body: formData
                                }
                            );


                        if (!voiceResponse.ok) {

                            throw new Error(
                                "Voice server error: " +
                                voiceResponse.status
                            );

                        }


                        const voiceData =
                            await voiceResponse.json();


                        /* ============================= */
                        /*       SHOW USER TEXT           */
                        /* ============================= */

                        userText.innerHTML =
                            voiceData.text;


                        /* ============================= */
                        /*       SEND TO AI              */
                        /* ============================= */

                        status.innerHTML =
                            "Thinking...";


                        const chatResponse =
                            await fetch(
                                "/chat",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        message:
                                            voiceData.text
                                    })
                                }
                            );


                        if (!chatResponse.ok) {

                            throw new Error(
                                "Chat server error: " +
                                chatResponse.status
                            );

                        }


                        const chatData =
                            await chatResponse.json();


                        /* ============================= */
                        /*       SHOW AI RESPONSE         */
                        /* ============================= */

                        aiText.innerHTML =
                            chatData.response;


                        /* ============================= */
                        /*       GENERATE AI VOICE        */
                        /* ============================= */

                        status.innerHTML =
                            "Speaking...";


                        const speechResponse =
                            await fetch(
                                "/speak",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        text:
                                            chatData.response
                                    })
                                }
                            );


                        if (!speechResponse.ok) {

                            throw new Error(
                                "Speech server error: " +
                                speechResponse.status
                            );

                        }


                        /* ============================= */
                        /*       GET AUDIO FROM SERVER    */
                        /* ============================= */

                        const audioBlob =
                            await speechResponse.blob();


                        const audioURL =
                            URL.createObjectURL(
                                audioBlob
                            );


                        const audio =
                            new Audio(audioURL);


                        /* ============================= */
                        /*          PLAY AUDIO            */
                        /* ============================= */

                        audio.play();


                        audio.onended =
                            function () {

                                URL.revokeObjectURL(
                                    audioURL
                                );

                                status.innerHTML =
                                    "Tap to speak";

                            };


                    } catch (error) {

                        console.error(error);

                        aiText.innerHTML =
                            "Sorry Boss, something went wrong.";

                        status.innerHTML =
                            "Tap to speak";

                    }

                };


            /* ============================= */
            /*        START RECORDING         */
            /* ============================= */

            mediaRecorder.start();

            listening = true;

            voiceButton.innerHTML = "🔴";

            status.innerHTML =
                "Listening...";

            userText.innerHTML =
                "I'm listening to you...";


        } catch (error) {

            console.error(error);

            status.innerHTML =
                "Microphone access denied.";

        }

    }


    /* ============================= */
    /*         STOP RECORDING         */
    /* ============================= */

    else {

        mediaRecorder.stop();

        listening = false;

        voiceButton.innerHTML = "🎙";

        status.innerHTML =
            "Processing...";

    }

});


/* ============================= */
/*          TEXT BUTTON           */
/* ============================= */

textButton.addEventListener(
    "click",
    function () {

        textBox.classList.toggle(
            "hidden"
        );

        textInput.focus();

    }
);


/* ============================= */
/*         TEXT CHAT              */
/* ============================= */

async function sendMessage() {

    const message =
        textInput.value.trim();


    if (message === "") {

        return;

    }


    userText.innerHTML =
        message;


    textInput.value =
        "";


    aiText.innerHTML =
        "Thinking...";


    try {

        const response =
            await fetch(
                "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error: " +
                response.status
            );

        }


        const data =
            await response.json();


        aiText.innerHTML =
            data.response;


    } catch (error) {

        console.error(error);

        aiText.innerHTML =
            "Sorry Boss, something went wrong.";

    }

}


/* ============================= */
/*          SEND BUTTON           */
/* ============================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* ============================= */
/*           ENTER KEY            */
/* ============================= */

textInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


/* ============================= */
/*        SETTINGS BUTTON         */
/* ============================= */

settingsButton.addEventListener(
    "click",
    function () {

        settingsBox.classList.toggle(
            "hidden"
        );

    }
);


/* ============================= */
/*        CLOSE SETTINGS          */
/* ============================= */

closeSettings.addEventListener(
    "click",
    function () {

        settingsBox.classList.add(
            "hidden"
        );

    }
);