let express = require("express")
let app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(9000, () => {
    console.log("Running at port : 9000")
})

// Post data with picture
app.use("/album", require("./routes/createAlbum"))

// Post data without picture
app.use("/album", require('./routes/createAlbum'))

// //Home page route
app.use("/", require("./routes/backendCheck"))

// Get picture
app.use("/pic", require('./routes/getAlbumPicture'))

// Get all albums
app.use("/albums", require("./routes/getAlbum"))

// Delete Album from id 
app.use("/album", require("./routes/deleteAlbum"))

// Update
app.use("/album", require("./routes/updateAlbum"))

app.use("/album", require("./routes/updateAlbum"))

app.delete("/deleteAll", async (req, res) => {
    await prisma.$queryRaw("DELETE FROM album_details").then(async () => {
        await prisma.$queryRaw("DELETE FROM album").then(() => {
            return res.send({ status: "Delete Complete" })
        })
    })
})

module.exports = app