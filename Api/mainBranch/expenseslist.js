const Router = require("express").Router();
const { ExpenseList } = require( "../../Modal" );

Router.post( "/expense-list" , (req, res)=>{
    ExpenseList.find()
    .then( found => {
        if( found.length > 0 ){
            return res.json({ msg: "Expense List!",List:found,  success:true }).status(200);
        }else{
            return res.json ({ msg: "No Expense Adde Yet!", success:false } ).status(400);
        }
    } )
    .catch( err=> {
        console.log( "err" );
        return res.json ({ msg: "Failed!", success:false }).status(400);
    })
})

Router.post( "/add_expenses-to-list", ( req, res ) =>{
    const { name }  = req.body ;
    
    ExpenseList.findOne({ name : name })
    .then( foundBulk => {
        if( foundBulk ){
            return res.json({ msg: "ALREADY Added!", success:false }).status( 400 );
        }else{
            let newExpenseList = new ExpenseList ({
                name : name
            })
            newExpenseList.save()
            .then( sExpense =>{
                return res.json ({ msg:  "Expense Added to List!", expense : sExpense,  success:true }).status(200);
            })
            .catch( err=> {
                console.log( err );
                return res.json ({ msg : "Error!", success:false }).status(400);
            })
        }
    } )
    .catch( err=> {
        console.log( "err" );
        return res.json ({ msg: "Stage already Exist" })
    })
} )


module.exports = Router;
