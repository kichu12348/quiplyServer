const router = require("express").Router();
const {sendFileToClient,sendSongList,sendSongImg} = require("../controllers/songs");

router.get("/list", sendSongList);
router.get("/downloadFile",sendFileToClient);
router.get('/song',sendSongImg);


module.exports = router;