//AXIOS IS AVAILABLE SINCE I ADDED AXIOS LIBRARY TO THE GLOBAL SCOPE
//console.log(axios)


const login = async  (email, password)  => {

  try 
  {
    //http://localhost:3000/natours/api/v1/users/login
    const result = await  axios({
        method:'POST', 
        url:'http://localhost:3000/natours/api/v1/users/login',
        data:{
            email , 
            password
        }
    })

    console.log(result)

  }
  catch(error)
  {
     
    console.log(error.response.data)
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