<h2>Social Network API</h2>

Social network api built using Node.js, Express and MongoDB(Mongoose).

<h2>installation and running locally</h2>

npm install

npm start (port 3000)

npm run dev (nodemon) (port 3000)

<h2>Endpoints</h2>

<h4>POST REQUESTS</h4>

- Register for a new account (firstName, lastName, email, password, birthDate, gender)
  - https://h-social-network.herokuapp.com/register

- Login (email, password)
  - https://h-social-network.herokuapp.com/login

- Set/update profile photo (profilePhoto)
  - https://h-social-network.herokuapp.com/profilePhoto
 
- Set/update cover image (image)
  - https://h-social-network.herokuapp.com/coverImage

- Add personal information: all fields are optional (location, socialCondition, work, study, bio, religion)
  - https://h-social-network.herokuapp.com/personalInfo

- Add a new post : required ( content ), optional ( image, location )
  - https://h-social-network.herokuapp.com/addPost

<h4>PUT REQUESTS</h4>
...
...
...
<h4>GET REQUESTS</h4>

- Get your profile
  - https://h-social-network.herokuapp.com/myProfile

- Get your posts
  - https://h-social-network.herokuapp.com/myPosts

- Get all posts
  - https://h-social-network.herokuapp.com/allPosts

- Get a user's profile
  - https://h-social-network.herokuapp.com/profile/:userId

<h4>DELETE REQUESTS</h4>

- Delete a post
  - https://h-social-network.herokuapp.com/deletePost/:postId
