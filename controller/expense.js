const Expense = require('../models/expenses');
const AWS = require('aws-sdk');
const authenticate = require('../middleware/auth')
const tbldownloadFile=require('../models/downloadfilerecord');

const downloadexpense = async (req, res) => {
    try{
        const expenses= await Expense.findAll({where:{userId:req.user.id}});
        const  stringifyExpenses = JSON.stringify(expenses);
        const userId= req.user.id;
        const filename=`Expense${userId}/${new Date()}.txt`;
        const fileURL= await uploadToS3(stringifyExpenses, filename);
       // await tbldownloadFile.create({url:fileURL,userId:req.user.id});
        console.log(fileURL);
        res.status(200).json({fileURL, success:true})
    }
    catch(err){
        console.log(err);
        res.status(500).json({fileURL:'', success:false, err: err});
    }
}

function uploadToS3(data,filename) {

    const BUCKET_NAME= 'expenseapp1992';
    const IAM_USER_KEY= 'AKIAVA5DVWXK3Y5AQY5N';
    const  IAM_USER_SECRET= '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';

    let s3bucket=new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })
     var params={
            Bucket:BUCKET_NAME,
            Key:filename,
            Body:data,
            ACL:'public-read'
        }
       return new Promise((resolve, reject) => {
            s3bucket.upload(params,(err,s3response)=>{
                if(err){
                    console.log("SOMETHING WENT WRONG",err)
                    reject(err);
                } 
                else{
                   // console.log('success',s3response)
                   // return s3response.location;
                    resolve(s3response.Location)
                    }
                })
       })     
}

const fetchdata=(async(req,res)=>{
    console.log("i am fetch daling"+req.user.id);
    console.log("i am premi"+req.user.ispremium);
    
    try {
        const limit_per_page=parseInt(req.query.param2);
        const pageNumber=parseInt(req.query.param1)
        console.log("pagenumber----------"+pageNumber); 
        console.log("rowpersize----------"+req.query.param2);
        const totalitem = expensemodels.count({where:{userId: req.user.id}})
        .then(async(totalitem)=>{

       
          const expenseDetails = await expensemodels.findAll({  
                where:{
                    userId:req.user.id
                },
                offset:(pageNumber-1)*limit_per_page,
                limit:limit_per_page
            });
            console.log("data_length"+expenseDetails.length+""+expenseDetails);

            if(expenseDetails.length>0 && expenseDetails!==null && expenseDetails!==undefined)
            {
            res.status(200).json({success:true,msg:"Record Fetch successfully",expenseDetails,ispremiumuser:req.user.ispremium,
            currentPage:pageNumber,
            hasNextPage:limit_per_page*pageNumber<totalitem,
            nextPage:parseInt(pageNumber)+1,
            hasPreviousPage:pageNumber>1,
            previousPage:pageNumber-1,
            lastPage:Math.ceil(totalitem/limit_per_page),
            limit_per_page
        });
   
        }else if(expenseDetails.length===0){
            res.status(200).json({success:false,msg:"No Record Found",expenseDetails,ispremiumuser:req.user.ispremium});
        }
    });
    } catch (error) {
        res.status(400).json({success:false,msg:"Something went wrong"});
        throw new Error()
    }
})


const addexpense = (req, res) => {
    const { expenseamount, description, category } = req.body;

    if(expenseamount == undefined || expenseamount.length === 0 ){
        return res.status(400).json({success: false, message: 'Parameters missing'})
    }
    
    Expense.create({ expenseamount, description, category, userId: req.user.id}).then(expense => {
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(500).json({success : false, error: err})
    })
}

const getexpenses = (req, res)=> {
    
    Expense.findAll({ where : { userId: req.user.id}}).then(expenses => {
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        console.log(err)
        return res.status(500).json({ error: err, success: false})
    })
}

const deleteexpense = (req, res) => {
    const expenseid = req.params.expenseid;
    if(expenseid == undefined || expenseid.length === 0){
        return res.status(400).json({success: false, })
    }
    Expense.destroy({where: { id: expenseid, userId: req.user.id }}).then((noofrows) => {
        if(noofrows === 0){
            return res.status(404).json({success: false, message: 'Expense doenst belong to the user'})
        }
        return res.status(200).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ success: true, message: "Failed"})
    })
}

const downloadexpensedataAllFile=((req,res)=>{
    try {
        const downloadFileData =  downloadFile.findAll({where:{userId: req.user.id}});
        res.status(200).json({success:true,downloadFileData});
    } catch (error) {
        res.status(500).json({success:false,error:error});
    }

});

const  ispremiumuser = async(req,res)=>{
    try {
        const  ispremiumuser= await userDetails.findAll({where:{id:req.user.id}});
        console.log("is----------"+ispremiumuser[0]. ispremiumuser);
        res.json({ ispremiumuser: ispremiumuser[0]. ispremiumuser});
    } catch (error) {
        console.log('something went wrong');
    }
} 

module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadexpense,
    downloadexpensedataAllFile,
    fetchdata,
    ispremiumuser
}