const router = require("express").Router()
let path = require("path")
let uploadPath = path.join(__dirname, '..', '/uploads/')
// Get picture
router.get("/:pic", (req, res) => {
    let picFile = req.params.pic
    let filePath = path.join(uploadPath + picFile)
    return res.sendFile(filePath)
})

module.exports = router