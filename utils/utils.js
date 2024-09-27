//convert date from DB format to readable
const convertDate = (stringDate) => {
    const date = new Date(stringDate);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`
    // console.log("Formatted date: ", formattedDate);
    return formattedDate;
}

module.exports = convertDate;