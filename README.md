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
 
- Set/update cover image (coverImage)
  - https://h-social-network.herokuapp.com/coverImage

- Add personal information: all fields are optional (location, socialCondition, work, study, bio, religion)
  - https://h-social-network.herokuapp.com/personalInfo

- Add a new post : required ( content ), optional ( image, location )
  - https://h-social-network.herokuapp.com/addPost

- Follow or unfollow a user 
  - https://h-social-network.herokuapp.com/follow/:userId

- Set or unset dark mode
  - https://h-social-network.herokuapp.com/darkMode

<h4>PUT REQUESTS</h4>

- Update post content (content, location)
  - https://h-social-network.herokuapp.com/updatePost/:postId

- Update post image (image)
  - https://h-social-network.herokuapp.com/updatePostImage/:postId

- Update profile info -all are optional- (firstName, lastName, email, password, birthDate, gender, location, socialCondition, work, study, bio, religion)
  - https://h-social-network.herokuapp.com/profile

- Change password (password, newPassword)
  - https://h-social-network.herokuapp.com/changePassword


<h4>GET REQUESTS</h4>

- Get your profile
  - https://h-social-network.herokuapp.com/myProfile

- Get your posts
  - https://h-social-network.herokuapp.com/myPosts

- Get all posts
  - https://h-social-network.herokuapp.com/allPosts

- Get your following posts
  - https://h-social-network.herokuapp.com/followingPosts

- Get a user's profile
  - https://h-social-network.herokuapp.com/profile/:userId

- Get my followers 
  - https://h-social-network.herokuapp.com/myFollowers

- Get my followings
  - https://h-social-network.herokuapp.com/myFollowings

- Get a user followers
  - https://h-social-network.herokuapp.com/userFollowers/:userId

- Get a user followings
  - https://h-social-network.herokuapp.com/userFollowings/:userId

<h4>DELETE REQUESTS</h4>

- Delete main profile photo
  - https://h-social-network.herokuapp.com/mainProfilePhoto

- Delete previous profile photo
  - https://h-social-network.herokuapp.com/oldProfilePhoto/:photoId

- Delete cover image
  - https://h-social-network.herokuapp.com/coverImage
  
- Delete a post
  - https://h-social-network.herokuapp.com/deletePost/:postId
 
