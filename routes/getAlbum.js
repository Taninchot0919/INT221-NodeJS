const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { album } = new PrismaClient()

let moment = require("moment")

// Get all albums
router.get("/", async (req, res) => {
    let allAlbums = await album.findMany({
        include: {
            artist: true,
            albumType: true,
            album_details: true
        }
    })
    allAlbums.forEach(album => {
        album.release_date = moment(album.release_date).format("YYYY-MM-DD")
    })
    return res.send({ data: allAlbums })
})




module.exports = router