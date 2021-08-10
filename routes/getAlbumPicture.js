const router = require("express").Router()
let path = require("path")
// Get picture
router.get("/:pic", (req, res) => {
    let picFile = req.params.pic
    let filePath = path.join(__dirname, '..', '/uploads/' + picFile)
    return res.sendFile(filePath)
})

module.exports = router