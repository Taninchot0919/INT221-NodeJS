const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { album } = new PrismaClient()
const { album_details } = new PrismaClient()

// Delete Album from id 
router.delete("/:id", async (req, res) => {
    let id = req.params.id
    console.log(id)

    let albumPicture = await album.findMany({
        where: {
            a_id: id
        }
    })

    // albumPicture = albumPicture[0].cover_image
    // if (albumPicture != "default.png") {
    //     let filePath = path.join(__dirname + "/uploads/" + albumPicture)
    //     removePhoto(filePath)
    // }

    await album_details.deleteMany({
        where: {
            a_id: id
        }
    }).then(async () => {
        await album.delete({
            where: {
                a_id: id
            }
        })
    }).then(() => {
        return res.send({ status: "Delete Complete" })
    })
})

module.exports = router