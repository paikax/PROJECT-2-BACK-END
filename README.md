**After clone run theses command:**
PS C:\yourpath\super-server> 
Git fetch
Git pull
npm i

**To run the project**
PS C:\yourpath\super-server>\src\
Nodemon index.js

Test - API Endpoints
**Sign up:**
[httpl/api/auth/signup](http://localhost:3000/api/auth/signup)

Example data:
{
  "email": "youremail@gmail.com",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}

Fields have to enter
const { email, password, dateOfBirth, gender } = req.body;



 


