module.exports = async function (req, res, proceed) {
    const user = req.session;
    if (user.role == "sup") {
        return proceed();
    }
    return res.redirect("/home")
}