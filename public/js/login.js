//AXIOS IS AVAILABLE SINCE I ADDED AXIOS LIBRARY TO THE GLOBAL SCOPE
//console.log(axios)


const login = async  (email, password)  => {

  try 
  {
    //SEND DATA FROM HTML FORM - USING HTTP AJAX 
    //LATER WILL SEND FORM DATA DIRECTLY!!!
    const result = await  axios({
        method:'POST', 
        url:'http://localhost:3000/natours/api/v1/users/login',
        data:{
            email , 
            password
        }
    })

    //SUPER IMPORTANT - THE USER MENU WILL BE DISPLAYED AFTER 'RELOAD' - NAVIGATE BACK TO DIFFERENT PAGE / OR THIS PAGE 
    //USE THE window.assign!!!!! 
    //data is the JSON i sent back from my API
    if(result.data.status === 'success')
    {
        alert('Logged in Successfully!')
        window.setTimeout(() =>{
            location.assign('/')
        }, 1500)

    }
    console.log(result)

  }
  catch(error)
  {
     
    console.log(error.response.data)
    //HANDLING
    alert(error.response.data.message)
    
  }
}


document.querySelector('.form').addEventListener('submit', e => {


    //PREVENT FORM DEFAULT OF SUBMITTING TO THE SERVER URL - OF THE action attribute(by default URL is the current page URL)
    e.preventDefault();

    //EXTRACT FROM DATA
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value


    //LOGIN
    login(email, password)



})