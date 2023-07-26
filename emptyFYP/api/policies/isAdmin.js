module.exports = async function (req, res, proceed) {
    const user = req.session;
    if (user.role == "adm") {
        return proceed();
    }
    return res.redirect("/home")
}