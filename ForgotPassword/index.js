function forgotpassword(e) {
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    const userDetails = {
        email: form.get("email"),

    } 

    console.log(userDetails)
    axios.post('http://18.204.212.9//password/forgotpassword',userDetails).then(response => {
        if(response.status === 202){
            document.body.innerHTML += '<div style="color:red;">Mail Successfuly sent <div>'
            message.innerHTML="<h1>Reset Password link sent Successfully</h1>";
        } 
        
    }).catch(err => {
        document.body.innerHTML += `<div style="color:red;">${err} <div>`;
    })
   }
