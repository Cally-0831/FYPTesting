module.exports = async function (req, res, proceed) {


    if (req.session.role != null) {
      return proceed();
    }
  
    return res.redirect("/login");
  
  };