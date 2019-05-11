const parseJson = async (data) => {
    let key = Object.keys(data);
    key.forEach(function (k) {
        let thisIngredient = { [k]: data[k] };
        console.log(thisIngredient);
    });
}
exports.parseJson = parseJson;