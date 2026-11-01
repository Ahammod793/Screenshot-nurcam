/* RegionSelectionWindow.xaml.cs port: drag rectangle, four dimmed outside regions, live pixel dimensions. */
const img=document.querySelector("#desktopImage"),canvas=document.querySelector("#overlay"),ctx=canvas.getContext("2d"),label=document.querySelector("#sizeLabel");
let down=false,start=null,end=null,sourceBlobUrl=sessionStorage.getItem("nurcam-capture-url");
img.src=sourceBlobUrl||"";
function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);draw();}
addEventListener("resize",resize);img.addEventListener("load",resize);
function imageRect(){const r=img.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};}
function pos(e){return {x:e.clientX,y:e.clientY};}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);if(!start||!end)return;const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y),w=Math.abs(end.x-start.x),h=Math.abs(end.y-start.y);
ctx.fillStyle="rgba(0,0,0,.60)";ctx.fillRect(0,0,innerWidth,innerHeight);ctx.clearRect(x,y,w,h);ctx.strokeStyle="#818cf8";ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
const r=imageRect(),pw=Math.round(w*img.naturalWidth/r.width),ph=Math.round(h*img.naturalHeight/r.height);label.style.display="block";label.textContent=`${pw} × ${ph} px`;label.style.left=`${Math.min(x+w,innerWidth-100)}px`;label.style.top=`${Math.min(y+h+8,innerHeight-30)}px`;}
canvas.addEventListener("pointerdown",e=>{down=true;start=pos(e);end=start;canvas.setPointerCapture(e.pointerId);draw();});
canvas.addEventListener("pointermove",e=>{if(!down)return;end=pos(e);draw();});
canvas.addEventListener("pointerup",async()=>{if(!down)return;down=false;if(!start||!end)return;const r=imageRect(),left=Math.max(0,Math.min(start.x,end.x)-r.left),top=Math.max(0,Math.min(start.y,end.y)-r.top),w=Math.abs(end.x-start.x),h=Math.abs(end.y-start.y);
if(w<4||h<4)return;const sx=img.naturalWidth/r.width,sy=img.naturalHeight/r.height;const x=Math.floor(left*sx),y=Math.floor(top*sy),cw=Math.min(img.naturalWidth-x,Math.ceil(w*sx)),ch=Math.min(img.naturalHeight-y,Math.ceil(h*sy));
const bitmap=await createImageBitmap(await (await fetch(sourceBlobUrl)).blob());const c=document.createElement("canvas");c.width=cw;c.height=ch;c.getContext("2d").drawImage(bitmap,x,y,cw,ch,0,0,cw,ch);const blob=await new Promise(res=>c.toBlob(res,"image/png"));const url=URL.createObjectURL(blob);sessionStorage.setItem("nurcam-capture-url",url);sessionStorage.setItem("nurcam-capture-prefix","NurCam_Region");location.href="ScreenshotPreviewWindow.html";});
addEventListener("keydown",e=>{if(e.key==="Escape"){sessionStorage.removeItem("nurcam-region-mode");history.back();}});
