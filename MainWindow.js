/* MainWindow.xaml.cs logic ported to browser APIs.
   Browser capture permission is user-mediated; native HWND/GDI operations have no WebExtension equivalent. */
const statusEl=document.querySelector("#status");
const delayEl=document.querySelector("#delay");
const autoEl=document.querySelector("#autosave");
autoEl.checked=localStorage.getItem("nurcam-autosave")==="true";
autoEl.addEventListener("change",()=>localStorage.setItem("nurcam-autosave",String(autoEl.checked)));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function prepareCapture(){const seconds=Number(delayEl.value)||0;if(seconds)await wait(seconds*1000);statusEl.textContent="Opening the browser's screen picker…";}
function openEditor(blob,prefix){const url=URL.createObjectURL(blob);sessionStorage.setItem("nurcam-capture-url",url);sessionStorage.setItem("nurcam-capture-prefix",prefix);sessionStorage.setItem("nurcam-autosave",String(autoEl.checked));window.location.href="ScreenshotPreviewWindow.html";}
async function captureDesktop(kind){
 let stream;
 try{
  await prepareCapture();
  stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:1},audio:false});
  const track=stream.getVideoTracks()[0];
  const settings=track.getSettings();
  const video=document.createElement("video");video.muted=true;video.playsInline=true;video.srcObject=stream;
  await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=reject;});
  await video.play();await wait(180);
  const canvas=document.createElement("canvas");canvas.width=video.videoWidth||settings.width;canvas.height=video.videoHeight||settings.height;
  canvas.getContext("2d",{willReadFrequently:true}).drawImage(video,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)throw new Error("Could not encode screenshot pixels.");
  track.stop();stream.getTracks().forEach(t=>t.stop());stream=null;
  if(kind==="region"){
   sessionStorage.setItem("nurcam-capture-url",URL.createObjectURL(blob));
   sessionStorage.setItem("nurcam-capture-prefix","NurCam_Region");
   location.href="RegionSelectionWindow.html";
   return;
  }
  openEditor(blob,kind==="active"?"NurCam_ActiveWindow":kind==="select"?"NurCam_SelectedWindow":"NurCam");
 }catch(error){statusEl.textContent=error.name==="NotAllowedError"?"Capture cancelled or permission denied.":error.message;}
 finally{if(stream)stream.getTracks().forEach(t=>t.stop());}
}
document.querySelectorAll("[data-capture]").forEach(button=>button.addEventListener("click",()=>captureDesktop(button.dataset.capture)));
