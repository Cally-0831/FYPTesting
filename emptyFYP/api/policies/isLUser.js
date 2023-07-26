module.exports = async function (req, res, proceed) {
    const user = req.session;
    if (user.role == "obs" || user.role== "stu") {
        return proceed();
    }
    return res.redirect("/home")
}