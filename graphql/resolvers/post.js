const { AuthenticationError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../utils/checkAuth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });

        return posts;
      } catch (error) {
        console.error("Get posts error : ", error);
        throw new Error(error);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);

        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        console.error("Get post error : ", error);
        throw new Error("Post not found");
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context);

      const newPost = new Post({
        body,
        user: user.indexOf,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      context.pubsub.publish("NEW_POST", { newPost: post });
      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);

        if (user.username === post.username) {
          await post.delete();

          return "Post is deleted";
        } else {
          throw new AuthenticationError("Action is not allowed");
        }
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
