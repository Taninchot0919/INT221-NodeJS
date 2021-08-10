let moment = require("moment")

let formatDate = (oldDate) => {
    let date = new Date(oldDate)
    date.setDate(date.getDate())
    return oldDate = moment(date).format()
}

module.exports = formatDate