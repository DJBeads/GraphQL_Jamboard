const mongoose = require('mongoose');
const express = require('express')
const {graphqlHTTP} = require ('express-graphql')
const {buildSchema} = require('graphql')
const User = require('./mongo/user');
const Board = require('./mongo/board');

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
        x:String,
        y:String,
       }
     type Post { 
        _id: String
        text:String,
        author:String,
        x:String,
        y:String,
        }
     input updatepostInput {
        boardId:String,
        postId:String,
        text:String,
        author:String,
        x:String,
        y:String,
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
    input DeleteEditorInput {
        boardId: String
        editorId: String
    }
    type DeleteEditor {
        editorId: String 
    }
    
      
    type Query {     
        userById(id:String!): User     
        userByName(name:String!): User         
    }    
    type Mutation {     
        createUser(user: UserInput): User   
        createBoard(board: BoardInput): Board 
        deleteBoard(deleteBoard: deleteBoardInput): DeleteBoard
        
        addBoardEditor(editor: editorInput): Editor   
        deleteBoardEditor(deleteEditor: DeleteEditorInput): DeleteEditor 
        
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
        async deleteBoard({deleteBoard}){
            const board = await Board.deleteOne({ _id: deleteBoard.boardId});
            console.log(board);
        },


        async addBoardPost({post}){
            const board = await Board.findOne({_id: post.boardId});
            console.log(board)
            board.post.push(post);
            await board.save();
        },
        async updateBoardPost({post}){
            const board = await Board.findOneAndUpdate(
                {_id: post.boardId, "post._id" : post.postId},
                {$set: {"post.$.text": post.text}});
        },
        async deleteBoardPost({deletePost}){
            const board = await Board.updateOne(
                {_id: deletePost.boardId},
                {$pull: {post: {_id: deletePost.postId}}
                });
        },
        async deleteBoardEditor({deleteEditor}){
            const board = await Board.updateOne(
                {_id: deleteEditor.boardId},
                {$pull: {editor: deleteEditor.editorId}}
            );
        },

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