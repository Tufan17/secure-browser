const video=document.getElementById("video");
const canvas=document.getElementById("picture");
const takepicbutton=document.querySelector("a");
const startWebCam=document.querySelector(".startWebCam");

const webcam=new Webcam(video,"user",canvas);

startWebCam.addEventListener("click",()=>{
webcam.start();
});

takepicbutton.addEventListener("click",()=>{

    let picture=webcam.snap();
    takepicbutton.href=picture;
});