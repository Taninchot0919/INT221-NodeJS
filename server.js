let express = require("express")
let app = express();
let bodyParser = require("body-parser")
let mysql = require("mysql")
let moment = require("moment")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Connect To MySQL
let dbConnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "album_shop_test"
})

dbConnect.connect();

app.listen(9000, () => {
    console.log("Running at port : 9000")
})

//Home page route
app.get("/", (req, res) => {
    return res.send({ error: false, message: "Welcome to rest api with Node JS", written_by: "Taninchot Phuwaloertthiwat" })
})

// Get all albums
app.get("/album", (req, res) => {
    dbConnect.query("SELECT * FROM ALBUM", (error, results, field) => {
        if (error) {
            throw error
        }
        let message = "";
        if (results.length == 0) {
            message = "Table is empty"
            return res.send({ error: true, message: message })
        }
        // Front-End ต้องไปแปลง date เอง
        return res.send({ data: results })
    })
})

// let findMaxId = () => {
//     var maxId
//     dbConnect.query("SELECT MAX(a_id) as maxId from album", (error, result, field) => {
//         if (error) {
//             throw error
//         }
//         console.log("running function findMaxId")
//         maxId = result[0].maxId
//         console.log(maxId)
//     })
//     // console.log(maxId)
//     return maxId
// }

// findMaxId()

app.post("/add", (req, res) => {
    let albumId = req.body.a_id;
    let albumName = req.body.album_name;
    let price = req.body.price;
    let releaseDate = req.body.release_date;
    let description = req.body.description;
    let coverImage = req.body.cover_image;
    let artistId = req.body.art_id;
    let albumTypeId = req.body.at_id;

    releaseDate = moment(releaseDate).format("YYYY-MM-DD")
    console.log(releaseDate)
    if (!albumName && !price && !releaseDate && !description && !artistId && !albumTypeId) {
        return res.status(400).send({ error: true, message: "Please fill all form" })
    }
    dbConnect.query('INSERT INTO album VALUES (?,?,?,?,?,?,?,?)', [albumId, albumName, price, releaseDate, description, coverImage, artistId, albumTypeId],
        (error, results, field) => {
            if (error) {
                throw error
            }
            return res.send({ error: false, data: results, message: "Successfully Added!!!" })
        })
})

module.exports = app