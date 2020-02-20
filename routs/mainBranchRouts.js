const Router = require('express').Router();

Router.use( "/auth" , require("../Api/mainBranch/auth") );
Router.use( "/category" , require("../Api/mainBranch/category") );
Router.use( "/vendor", require("../Api/mainBranch/vendor"));
Router.use( "/bulk", require("../Api/mainBranch/bulk"));
Router.use( "/expense", require("../Api/mainBranch/expenseslist"));


module.exports = Router; 