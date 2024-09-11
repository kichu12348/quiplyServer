const fs = require("fs");
const path = require("path");
const { title } = require("process");

function sendFileToClient(req, res) {
  const { fileName } = req.query;
  const filePath = path.join(__dirname, `../Songs/${fileName}`);
  if (fs.existsSync(filePath)) {
    return res.status(200).download(filePath, fileName, (err) => {
        if (err) {
            res.json({ success: false, error: { message: "Error downloading file" } });
        }
        });
  }
  return res.json({ success: false, error: { message: "File not found" } });
}

const songList =[{
    song: 'resoH.mp3',
    image:"resoIMG.png",
    title: "Resonance",
    id:"6eaa721c-3174-4017-866b-fed440e62e96"
},{
  song:"calm.mp3",
  image:"calmIMG.jpg",
  title: "Calm",
  id:"22fa77c7-0bb4-48b0-8f45-bd94247e6143"
},{
  song:"snowfall.mp3",
  image:"snowfall.png",
  title: "Snowfall",
  id:"f4a4c0e2-2b2b-4c3c-8d7f-7e1b9c1d1e8d"
},{
  song:"watchingStar.mp3",
  image:"peace.jpg",
  title: "Stars",
  id:"f17ebfc9-a963-4363-9970-4a07ea81c7e0"
},{
  song:"Roi.mp3",
  image:"roi.jpg",
  title: "Roi",
  id:"f17ebfc9-a963-4363-9970-deu897ea81c7e0"
},{
 song:"goth.mp3",
 image:"goth.png",
 title:"Goth",
 id:"hehehebeiygejsush1273-678ghe"
}
];


function sendSongList(req, res) {
  return res.json({ success: true, songList });
}

function sendSongImg(req,res){
const {image} = req.query;
const filePath = path.join(__dirname, `../Songs/${image}`);
if (fs.existsSync(filePath)){
    return res.status(200).sendFile(filePath);
}
return res.sendFile(path.join(__dirname, "../Songs/fileNotFound.png"));
}

module.exports = { sendFileToClient, sendSongList, sendSongImg };
