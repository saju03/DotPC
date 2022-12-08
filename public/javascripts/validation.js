var errorName = document.getElementById('name')
    var errorEmail = document.getElementById('email')
    var errorPassword = document.getElementById('passwords')
    
    var errorPhonenumber = document.getElementById('phonenumbers')
    function validateName() {
        const name = document.getElementById('Name').value;
        if (name == "") {
            errorName.innerHTML = 'Enter your Name'
            return false
        }
        if (!name.match(/^[a-zA-Z ]*$/)) {
            errorName.innerHTML = 'Number are not allowed'
            return false
        }
         if (name.match(/^[ ]*$/)) {
            errorName.innerHTML = 'enter a valid name'
            return false
        }
        errorName.innerHTML = null
        return true
    }
    function validEmail() {
        const email = document.getElementById('Email').value
        if (email == "") {
            errorEmail.innerHTML = "enter you email address"
            return false
        }
        if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
            errorEmail.innerHTML = 'enter a proper email address'
            return false
        }
        errorEmail.innerHTML = null
        return true
    }
    function validPassowrd() {
        const psd = document.getElementById('Passwords').value
        if (psd == "") {
            errorPassword.innerHTML = "enter a password"
            return false
        }
        if (psd.length < 5) {
           
            errorPassword.innerHTML = "password should be more than five characters"
            return false
        }
        errorPassword.innerHTML = null
        return true
    }
 
    
 
     function validPhoneumber() {
        const mob = document.getElementById('Phonenumbers').value
        if (mob == "") {
            errorPhonenumber.innerHTML = "enter a phonenumber"
            return false
        }
        if (mob.length != 10 || !mob.match(/^\d*$/)) {
            errorPhonenumber.innerHTML = "Please Enter the valide phone number"
            return false
        }
        errorPhonenumber.innerHTML = null
        return true
    }
 
        function check(){
              let validatearray =[!validateName() , !validEmail() , !validPassowrd() , !validPhoneumber()]
 
              return validatearray.every(validation)
             
 
        }
 
 
 
    function validation() {
        if (!validateName() || !validEmail() || !validPassowrd() || !validPhoneumber() ) {
            return false
        }
        return true
    }
