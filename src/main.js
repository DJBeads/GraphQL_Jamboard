const mongoose = require('mongoose');
const express = require('express')
const {graphqlHTTP} = require ('express-graphql')
const {buildSchema} = require('graphql')
const User = require('./mongo/user');
const Board = require('./mongo/boards');

const PORT = 3000

const app = express()
app.use(express.json());
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const schema = buildSchema(` 
    input UserInput {       
        firstName: String       
        lastName: String       
        emailAddress: String!       
        password: String!     
    }    
      
    type User {        
        _id: String        
        firstName: String        
        lastName: String        
        emailAddress: String
    }  
    
    input BoardInput {            
        owner: String        
    } 
    
    type Board {        
        _id: String               
        owner: String 
    }
     input editorInput { 
        boardId: String           
        editor: String        
    } 
     type Editor { 
        boardId: String                      
        editor: String 
    }
     input postInput {
        boardId:String,
        text:String,
        author:String,
        x:Number,
        y:Number,
       }
     type Post { 
        _id: String
        text:String,
        author:String,
        x:Number,
        y:Number,
        }
     input updatepostInput {
        boardId:String,
        postId:String,
        text:String,
        author:String,
        x:Number,
        y:Number,
       }   
     input deletepostInput { 
        boardId: String           
        postId: String        
    } 
     type DeletePost { 
       postId: String  
    }   
    input deleteBoardInput { 
        boardId: String           
              
    } 
     type DeleteBoard {            
        boardId: String  
    }
      
    type Query {     
        userById(id:String!): User     
        userByName(name:String!): User         
    }    
    type Mutation {     
        createUser(user: UserInput): User   
        createBoard(board: BoardInput): Board 
        deleteBoard(deleteboard: deleteBoardInput): DeleteBoard
        
        addBoardEditor(editor: editorInput): Editor   
        deleteBoardEditor(editor: editorInput): Editor 
        
        addBoardPost(post: postInput): Post
        updateBoardPost(post: updatepostInput): Post
        deleteBoardPost(deletePost: deletepostInput): DeletePost
        
    }  
     
    `);


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: {

         async userById({id}){
            const user = await User.findById(id)
             return user;
         },
        async userByName({name}){
            const user = await User.findOne({emailAddress: name});
            return user;
        },
        async createUser({user}){
            const model = new User(user);
            await model.save();
            return model;
        },


        async createBoard({board}){
            const model = new Board(board);
            await model.save();
            return model;
        },
        async addBoardEditor({editor}){

            const board = await Board.findOne({_id: editor.boardId});
            console.log(board)
            board.editor.push(editor.editor);

            await board.save();
        },
        async deleteBoard({deleteboard}){
            console.log(deleteboard)
            Board.deleteOne({ _id: deleteboard.boardId}, function (err) {
                if(err) console.log(err);
                console.log("Successfully deleted.");
            });
        },


        async addBoardPost({post}){
            const board = await Board.findOne({_id: post.boardId});
            console.log(board)
            board.post.push(post);
            await board.save();
        },
        async updateBoardPost({post}){
            console.log(post)
            const board = await Board.findOne({_id: post.boardId});
            const updatePost = post.postId;

            console.log(board)
            for(let i=0;i < board.post.length; i++){
                if (updatePost==board.post[i]._id){

                    board.post[i].overwrite(post);

                    console.log(board);
                    await board.save();
                    break
                }else {
                    console.log('Nothing there.');
                }
            }
            await board.save();
        },
        async deleteBoardPost({deletePost}){
            const board = await Board.findOne({_id: deletePost.boardId});
            let post = deletePost.postId;

            for(let i=0;i < board.post.length; i++){
                if (post==board.post[i]._id){
                    board.post.splice(i,1);
                    await board.save();
                    break
                }else {
                    console.log('Not possible.');
                }
            }

        },
        async deleteBoardEditor({editor}){
            const board = await Board.findOne({_id: editor.boardId});
            let editorId = editor.editor;

            for(let i=0;i < board.editor.length; i++){
                if (editorId==board.editor[i]){
                    board.editor.splice([i]);
                    board.save();
                    console.log(board.editor);
                }else {
                    console.log(board.editor[i]);
                }
            }
        }
    },
    graphiql: true,
}));


mongoose.connect('mongodb://localhost:27017', {
    user: 'root',
    pass: 'example',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, error => {
    if(!error) {
        app.listen(PORT, () => {
            console.log(`Example app listening at http://localhost:${PORT}`)
        })
    } else {
        console.error('Failed to open a connection to mongo db.', error);
    }
});