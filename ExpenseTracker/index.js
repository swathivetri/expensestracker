const pagination=document.getElementById('pagination');
const message=document.getElementById('msg');

const selectElement = document.getElementById("rowPerPage");
console.log(selectElement.value);

selectElement.addEventListener("change", async () => {
  const selectedOption = selectElement.selectedOptions[0];
  console.log(`Selected option: ${selectedOption.value}`);  
  const rowsize=selectedOption.value;
  localStorage.setItem('pagesize',rowsize);
  const token=localStorage.getItem("token");

  const pageno = localStorage.getItem('pageno');
  const expenseDetails = await axios.get(`http://35.173.245.87:3000/expense/getexpenses?param1=${pageno}&param2=${rowsize}`,{headers: {"Authorization":token}});
            showPagination(
            expenseDetails.data.currentPage,
            expenseDetails.data.hasNextPage,
            expenseDetails.data.nextPage,
            expenseDetails.data.hasPreviousPage,
            expenseDetails.data.previousPage,
            expenseDetails.data.lastPage)
            table.innerHTML="";
        for (let index = 0; index < expenseDetails.data.expenseDetails.length; index++) {
       display(expenseDetails.data.expenseDetails[index]);
        }
       //display(expenseDetails);
  console.log(expenseDetails);

});
function addNewExpense(e){
    e.preventDefault();
   
    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,
        
    }
    console.log(expenseDetails)
    const token  = localStorage.getItem('token')
      const adddata = axios.post('http://35.173.245.87:3000/expense/addexpense',expenseDetails,  { headers: {"Authorization" : token} })
        .then((response) => {

            if(adddata)
            {
                console.log(adddata.data.msg);
                //location.reload();
                addOnScreen(expenseDetails,adddata.data.userid);
            }
        addNewExpensetoUI(response.data.expense);

    }).catch(err => showError(err))

   }


function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden"
    document.getElementById('message').innerHTML = "You are a premium user "
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', ()=> {
    const pageno=1;
    localStorage.setItem('pageno',pageno);
    var pageSize = localStorage.getItem('pagesize') || 5;
    const token  = localStorage.getItem('token')
    console.log("token"+token);
    console.log("i am window listner");
    const decodeToken = parseJwt(token)
    console.log(">>>>>>>>>>>>",decodeToken);
    const ispremiumuser = decodeToken.ispremiumuser
    if(ispremiumuser){
        showPremiumuserMessage()
        showLeaderboard()
    }

    const expenseDetails = axios.get('http://35.173.245.87:3000/expense/getexpenses?param1=${pageno}&param2=${pageSize}', { headers: {"Authorization" : token} })
    .then(response => {
            response.data.expenses.forEach(expense => {

                addNewExpensetoUI(expense);
            })
            if(expenseDetails.data.expenseDetails.length<=0)
        {
            message.innerHTML='<h1>No record found</h1>';
        }else
        {
            message.innerHTML='';
        }
        showPagination(
            expenseDetails.data.currentPage,
            expenseDetails.data.hasNextPage,
            expenseDetails.data.nextPage,
            expenseDetails.data.hasPreviousPage,
            expenseDetails.data.previousPage,
            expenseDetails.data.lastPage)
       for (let index = 0; index < expenseDetails.data.expenseDetails.length; index++) {
        display(expenseDetails.data.expenseDetails[index]);
       }
    }).catch(err => {
        showError(err)
    })
});

function display(data){

    const tbl=` 
    <tr id=${data.id}>   
   <td hidden>${data.id}</td>
    <td>${data.expense}</td>
    <td>${data.category}</td>
    <td>${data.description}</td>
    <td><button type="button" onclick=editexpense('${data.id}','${data.expense}','${data.expense}','${data.description}')>Edit</button></td>
    <td><button type="button" onclick=deletexpense('${data.id}')>Delete</button></td>
  <tr/>`
 
     tbl.innerHTML+=tbl;
}

function addNewExpensetoUI(expense){
    const parentElement = document.getElementById('listOfExpenses');
    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
        <li id=${expenseElemId}>
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick='deleteExpense(event, ${expense.id})'>
                Delete Expense
            </button>
        </li>`
}

function deleteExpense(e, expenseid) {
    const token = localStorage.getItem('token')
    axios.delete(`http://35.173.245.87:3000/expense/deleteexpense/${expenseid}`,  { headers: {"Authorization" : token} }).then(() => {

            removeExpensefromUI(expenseid);

    }).catch((err => {
        showError(err);
    }))
}

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}
function showLeaderboard(){
    const inputElement = document.createElement("input")
    inputElement.type = "button"
    inputElement.value = 'Show Leaderboard'
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://35.173.245.87:3000/premium/showLeaderBoard', { headers: {"Authorization" : token} })
        console.log(userLeaderBoardArray)

        var leaderboardElem = document.getElementById('leaderboard')
        leaderboardElem.innerHTML += '<h1> Leader Board </<h1>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.total_cost || 0} </li>`
        })
    }
    document.getElementById("message").appendChild(inputElement);

}

function removeExpensefromUI(expenseid){
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

const downloadexpense=document.getElementById('downloadexpense');
downloadexpense.addEventListener('click',download);

function download() {
    const token = localStorage.getItem('token');
    console.log(" i am download calling");
    axios.get('http://35.173.245.87:3000/expense/download', { headers: {"Authorization" : token}})
    .then((response) => {
        if(response.status === 200){
            console.log(response.data.fileurl);
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'myexpense.txt';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        showError(err)
    });
}

const downloadList=document.getElementById("download-table");

 function downloadAllFile()
{
    try {
        downloadList.innerHTML='';
        const token=localStorage.getItem("token");
      axios.get("http://35.173.245.87:3000/expense/downloaddataAllFile",{headers: {"Authorization":token}})
       .then((response)=>{
            if(response.status===200){
                console.log(response);
                for (let index = 0; index < response.data.downloadFileData.length; index++) {
                    console.log('i am download data11');
                    downloadfiledata(response.data.downloadFileData[index]);
                }
            }
       })

    } catch (error) {
        console.log(error);
    }
}

function downloadfiledata(data)
{
    const tbl=`<tr> 
                <td>${data.downloaddate}</td>
                <td>${data.filename}</td>
                <td><button type="button" onclick=downloadFile('${data.filename}')>Download</button></td>
              </tr>`
              downloadListtbl.innerHTML+=tbl;
}

function downloadFile(fileUrl) {
    var url = fileUrl; // replace with your file URL
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Expense.pdf'; // replace with your desired file name
    a.click();
  }

  function showPagination(
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
  )
  {
    //  table.innerHTML="";
    pagination.innerHTML='';
   if(hasPreviousPage){

    const btn2 =document.createElement('button')
    
    btn2.innerHTML = previousPage
    
    // btn2.addEventListener('click', () => getProducts(previousPage))
    btn2.addEventListener('click', function(event) {
        event.preventDefault();
        getProducts(previousPage);
      });
    
    pagination.appendChild(btn2)
    
    }
    
    const btn1 = document.createElement('button');
    
    btn1.innerHTML = `<h3>${currentPage}</h3>`
    
    // btn1.addEventListener('click', ()=>getProducts(currentPage))
    btn1.addEventListener('click', function(event) {
        event.preventDefault();
        localStorage.setItem('pageno',currentPage);
        getProducts(currentPage);
      });
    
    pagination.appendChild(btn1)


    if (hasNextPage) {

        const btn3= document.createElement('button')
        
        btn3.innerHTML = nextPage
        console.log('i am next page');
        // btn3.addEventListener('click', ()=>getProducts(nextPage))
        btn3.addEventListener('click', function(event) {
            event.preventDefault();
            getProducts(nextPage);
          });
        
        pagination.appendChild(btn3)
    
    }
}
    
 function getProducts (page){
     page.preventDefault();
    var pageSize = localStorage.getItem('pagesize') || 5;
    localStorage.setItem('pageno',page);
    table.innerHTML="";
    const token=localStorage.getItem("token");
    console.log("hey i am page callin");
    const expenseDetails = axios.get(`http://35.173.245.87:3000/expense/getexpenses?param1=${page}&param2=${pageSize}`,{headers: {"Authorization":token}})
        console.log(expenseDetails.data+"dddd");
        for (let index = 0; index <expenseDetails.data.expenseDetails.length; index++) {
            display(expenseDetails.data.expenseDetails[index]);
           }
         
         showPagination(
            expenseDetails.data.currentPage,
            expenseDetails.data.hasNextPage,
            expenseDetails.data.nextPage,
            expenseDetails.data.hasPreviousPage,
            expenseDetails.data.previousPage,
             expenseDetails.data.lastPage)
    
         }

document.getElementById('rzp-button1').onclick = async function (e) {
    const token = localStorage.getItem('token')
    const response  = await axios.get('http://35.173.245.87:3000/purchase/premiummembership', { headers: {"Authorization" : token} });
    console.log(response);
    var options =
    {
     "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
     "order_id": response.data.order.id,// For one time payment
     // This handler function will handle the success payment
     "handler": async function (response) {
        const res = await axios.post('http://35.173.245.87:3000/purchase/updatetransactionstatus',{
             order_id: options.order_id,
             payment_id: response.razorpay_payment_id,
         }, { headers: {"Authorization" : token} })
        
        console.log(res)
         alert('You are a Premium User Now')
         document.getElementById('rzp-button1').style.visibility = "hidden"
         document.getElementById('message').innerHTML = "You are a premium user "
         localStorage.setItem('token', res.data.token)
         showLeaderboard()
         .catch(() => {
            alert('Something went wrong. Try Again!!!')
        })
     },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function (response){
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
   
 });
}