"use strict";

const localVideo = document.getElementById("local");
const recordedVideo = document.getElementById("recorded");
const startBtn = document.getElementById("start");
const recordBtn = document.getElementById("record");
const playBtn = document.getElementById("play");
const downloadBtn = document.getElementById("download");
let mediaRecorder;
let recordedBlobs;

document.getElementById("container").style.textAlign = "center";

function getLocalMediaStream(mediaStream) {
  recordBtn.disabled = false;
  const localStream = mediaStream;
  localVideo.srcObject = mediaStream;
  window.stream = mediaStream;
}

function handleLocalMediaStreamError(error) {
  console.log(`navigator.getUserMedia error: ${error}`);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  alert("録画を開始しました！");
  recordedBlobs = [];
  const options = { mimeType: "video/webm;codecs=vp9" };

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (error) {
    console.log(`Exception while creating MediaRecorder: ${error}`);
    return;
  }

  console.log("Created MediaRecorder", mediaRecorder);
  recordBtn.textContent = "録画を終了";
  playBtn.disabled = true;
  downloadBtn.disabled = true;

  mediaRecorder.onstop = event => {
    console.log("Recorder stopped: ", event);
  };

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10);
  console.log("MediaRecorder started", mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  alert("映像をアーカイブしました！")
  console.log("Recorded media.");
}

startBtn.addEventListener("click", () => {

  const constraints = {
    audio: true,
    video: {
      width: 1280,
      height: 720
    }
  };
    
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(getLocalMediaStream)
    .catch(handleLocalMediaStreamError);
});

recordBtn.addEventListener("click", () => {
  if (recordBtn.textContent === "録画を開始") {
    startRecording();
  } else {
    stopRecording();
    recordBtn.textContent = "録画を開始";
    playBtn.disabled = false;
    downloadBtn.disabled = false;
  }
});

playBtn.addEventListener("click", () => {
  const superBuffer = new Blob(recordedBlobs, { type: "video/mp4" });
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob(recordedBlobs, { type: "video/mp4" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "rec.webm";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});
