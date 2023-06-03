async function login(e) {
    try{
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value

    }
    console.log(loginDetails)
    const response = await axios.post('http://35.173.245.87:3000/user/login',loginDetails)
    if(response.status === 200){
            alert(response.data.message)
            console.log(response.data)
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userDetails', JSON.stringify(response.data.user))
            window.location.href = "../ExpenseTracker/index.html"
    }else {
        throw new Error('Failed to login')
    }
    }catch(err){
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    }
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}