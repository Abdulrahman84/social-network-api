<h2>Social Network API</h2>

Social Network API Built Using Node.js, Express and MongoDB(Mongoose).

API:  https://social-network.onrender.com <br>
Live: https://mohhamedhassan.github.io/fakebook/auth/signin

<h2>installation and running locally</h2>

- You must creat .env file for Database URI, JWT secert key and Cloudinary API keys

npm install

npm start (port 3000)

npm run dev (nodemon) (port 3000)

<h2>Endpoints</h2>

<h4>POST REQUESTS</h4>

- Register for a new account (firstName, lastName, email, password, birthDate, gender)
  - https://social-network.onrender.com/register

- Login (email, password)
  - https://social-network.onrender.com/login

- Set/update profile photo (profilePhoto)
  - https://social-network.onrender.com/profilePhoto
 
- Set/update cover image (coverImage)
  - https://social-network.onrender.com/coverImage

- Add personal information: all fields are optional (location, socialCondition, work, study, bio, religion)
  - https://social-network.onrender.com/personalInfo

- Add a new post : required ( content ), optional ( image, location )
  - https://social-network.onrender.com/addPost

- Follow or unfollow a user 
  - https://social-network.onrender.com/follow/:userId

- Set or unset dark mode
  - https://social-network.onrender.com/darkMode

- Add comment on a post ( comment )
  - https://social-network.onrender.com/addComment/postId

<h4>PUT REQUESTS</h4>

- Update post content (content, location)
  - https://social-network.onrender.com/updatePost/:postId

- Update post image (image)
  - https://social-network.onrender.com/updatePostImage/:postId

- Update profile info -all are optional- (firstName, lastName, email, password, birthDate, gender, location, socialCondition, work, study, bio, religion)
  - https://social-network.onrender.com/profile

- Change password (password, newPassword)
  - https://social-network.onrender.com/changePassword

- update a comment of yours (id, comment)
  - https://social-network.onrender.com/updateComment 


<h4>GET REQUESTS</h4>

- Get your profile
  - https://social-network.onrender.com/myProfile

- Get your posts
  - https://social-network.onrender.com/myPosts

- Get all posts
  - https://social-network.onrender.com/allPosts

- Get your following posts
  - https://social-network.onrender.com/followingPosts

- Get a single post
  - https://social-network.onrender.com/singlePost/postId

- Get a user's profile
  - https://social-network.onrender.com/profile/:userId

- Get my followers 
  - https://social-network.onrender.com/myFollowers

- Get my followings
  - https://social-network.onrender.com/myFollowings

- Get a user followers
  - https://social-network.onrender.com/userFollowers/:userId

- Get a user followings
  - https://social-network.onrender.com/userFollowings/:userId

- Get all of your photos
  - https://social-network.onrender.com/allPhotos

- Get all of user's photos
  - https://social-network.onrender.com/allUserPhotos

- Get suggested users
  - https://social-network.onrender.com/suggestedUsers

- Search in all users
  - https://social-network.onrender.com/searchUsers?userName=search

- Get your notifications
  - https://social-network.onrender.com/myNotification

<h4>DELETE REQUESTS</h4>

- Delete main profile photo
  - https://social-network.onrender.com/mainProfilePhoto

- Delete previous profile photo
  - https://social-network.onrender.com/oldProfilePhoto/:photoId

- Delete cover image
  - https://social-network.onrender.com/coverImage
  
- Delete a post
  - https://social-network.onrender.com/deletePost/:postId

- Delete one or more personal information ( birthDate, gender, location, socialCondition, work, study, bio, religion ) 
  - https://social-network.onrender.com/deletePersonalInfo

- Delete a comment of yours (id)
  - https://social-network.onrender.com/deleteComment
 
