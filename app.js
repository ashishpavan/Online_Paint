window.onload=function(){

const canvas= document.getElementById("canvas");
const red = document.querySelector(".red");
const blue = document.querySelector(".blue");
const green = document.querySelector(".green");
const yellow = document.querySelector(".yellow");
const color_picker= document.querySelector(".color-picker");
const pen= document.querySelector(".pen-range");
const undo= document.querySelector(".undo");
const redo= document.querySelector(".redo");
const clear= document.querySelector(".clear");
const save= document.querySelector(".save");
const erase= document.querySelector(".eraser");


let restore_array=[];
let index=-1;

var firebaseConfig = {
    apiKey: "AIzaSyCCfTVgoqb1mkua-Nlcr54M7VuY078Uh2g",
    authDomain: "onlineeditor-8f754.firebaseapp.com",
    projectId: "onlineeditor-8f754",
    storageBucket: "onlineeditor-8f754.appspot.com",
    messagingSenderId: "412831599944",
    appId: "1:412831599944:web:f1334bbea4df27c8cf777d",
    measurementId: "G-3365LTLT95"
};

firebase.initializeApp(firebaseConfig);
console.log(firebase);
let db= firebase.firestore();
let storageRef = firebase.storage().ref();

canvas.width= window.innerWidth - 60;;
canvas.height= 400;
let context = canvas.getContext("2d");
context.fillStyle = "white";
context.fillRect(0,0,canvas.width,canvas.height);


let draw_color= "black";
let draw_width ="2";
let is_drawing=false;

red.addEventListener("click",()=>{
    draw_color="red";
});

blue.addEventListener("click",()=>{
    draw_color="blue";
});

green.addEventListener("click",()=>{
    draw_color="green";
});

yellow.addEventListener("click",()=>{
    draw_color="yellow";
});
color_picker.addEventListener("input",()=>{
    draw_color = color_picker.value;
    //console.log("onInput working");
})
pen.addEventListener("input",()=>{
    draw_width =  pen.value;
})
erase.addEventListener("click",eraser);

canvas.addEventListener("touchstart",start,false);
canvas.addEventListener("touchmove",draw,false);
canvas.addEventListener("mousedown",start,false);
canvas.addEventListener("mousemove",draw,false);

canvas.addEventListener("mouseout",stop,false);
canvas.addEventListener("touchend",stop,false);
canvas.addEventListener("mouseup",stop,false);

clear.addEventListener("click",clear_canvas);
undo.addEventListener("click",undo_last);
redo.addEventListener("click",redo_last);

function start(event){
    is_drawing=true;
    context.beginPath();
    context.moveTo(event.clientX-canvas.offsetLeft,
        event.clientY-canvas.offsetTop);
    event.preventDefault();
}

function draw(event){
    if(is_drawing){
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
        context.lineTo(event.clientX - canvas.offsetLeft,
            event.clientY - canvas.offsetTop);
       
    }
    event.preventDefault();
}
function stop(event){
    if( is_drawing){
        context.stroke();
        context.closePath();
        is_drawing = false;
    }
    if (event.type != "mouseout"){
    restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
    index+=1;
    }
    context.globalCompositeOperation = "source-over";
    event.preventDefault();
}

function clear_canvas(event){
    if(context){
        context.fillStyle ="white";
        context.clearRect(0,0,canvas.width, canvas.height);

    }
}

function eraser(event){
    if (context){
        draw_color="white";
        context.globalCompositeOperation = "destination-out"
    }
}

function undo_last(event){
    if(index<=0){
        clear_canvas();
    }else{
        index-=1;
        //restore_array.pop();
        context.putImageData(restore_array[index],0,0);
    }
}

function redo_last(event){
    if(index < restore_array.length-1){
        index+=1
        context.putImageData(restore_array[index],0,0);
    }
}

save.addEventListener("click",e=>{
    //get the data from user
    let user= "Pavan"
    let picTitle = "paint_image";

    db.collection("users")
    .add({
        name: user,
        title: picTitle
    })
    .then(function(docRef){
        console.log("Document written with Id: ",docRef.id);
    })
    .catch(function(error){
        console.error("Error adding Document: ",error);
    })
    var full =user+" "+picTitle;
    saveImage(full);
});

function saveImage(name){
    canvas.toBlob(function(blob){
        var image = new Image();
        image.src= blob+ '?' + new Date().getTime();;
        var metadata = {
            contentType: "image/png"
        };
        storageRef.child("images/"+ name)
        .put(blob,metadata)
        .then(function(snapshot)
        {
            console.log("Uploaded", snapshot.totalBytes,"bytes.");
        })
        .catch(function(error){
            console.error("Upload failed:", error);
        })
    });
}

async function load_image(){
    var docRef = db.collection("users").doc("pavan_agarwal");
    console.log(docRef)
    docRef
    .get()
    .then((doc) =>{
        console.log(doc);
        let name = doc.data().name;
        let title= doc.data().title;

        storageRef
        .child("images/"+ "Pavan"+ " "+ "paint_image")
        .getDownloadURL()
        .then(function(url){
            let img= document.createElement("img");
            url="https://cors-anywhere.herokuapp.com/"+url
            img.setAttribute('crossOrigin', '');
            img.src=url;
            img.addEventListener("load",function(){
                context.drawImage(img,0,0);
            })
        })
        .catch(function(error){
                console.error("Upload failed:", error);
            })


    })
    .catch(error=>{
        console.log("Error getting document:",error);
    })


}

load_image();






































}
