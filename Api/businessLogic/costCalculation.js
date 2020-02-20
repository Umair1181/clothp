const { BulkStages } = require("../../Modal");
class CostCalculationClass{
    constructor(  ){
        this.length = "";
        this.ppm = "";
        this.totalCost = "";
        this.processLevel = "";
        this.processStage = "";
        this.expenseList = "";
    }

    async processCalculator(){
        
        return this;
    }

    async setValues (  ppm, length, cost  ){
        this.length = length;
        this.ppm = ppm;
        this.totalCost = cost;
        return this;
    }


    async calculate( fBulk, newData){
        await this.setValues( fBulk.newBulkData.ppm, fBulk.newBulkData.length, newData.totalExpenseCost );
        this.ppm = await this.getPPMWithExpense( this.totalCost ) ;
        //  fBulk.newBulkData.ppm;
        // this.totalCost = await this.getCost()  ;
        this.ppm = await this.getppmShortage( newData.length );
        this.totalCost = await this.getCost()  ;
        let bulkStage = await BulkStages.findOne({ _id: newData.processStage });
        this.processLevel = bulkStage.level;
        this.processStage = bulkStage._id;
        this.expenseList = newData.expenseList;
        return this;
    }
    
    async getppmShortage ( newLength ){
        let shortage = this.length - newLength  ;
        console.log( `${this.ppm} + ( ( ${this.ppm} * ${shortage} ) / ( ${this.length} - ${shortage} ) ) ` );
        // console.log( shortage );
        // console.log( this.length );
        this.ppm = ( this.ppm + ( ( this.ppm * shortage ) / ( this.length - shortage ) ))
        console.log( this.ppm );
        return this.ppm ;
    }

    async getPPMWithExpense ( cost ) {
        this.ppm = await ( this.ppm + ( cost / this.length ));
        return this.ppm;
    }

    async getCost ( ){
        console.log( `${this.ppm} * ${this.length}` )
        this.totalCost = await ( this.ppm * this.length );
        return this.totalCost ;
    }

    
}
module.exports = CostCalculationClass;