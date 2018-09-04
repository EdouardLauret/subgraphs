# Subgraphs

Subgraphs is a visual IDE for developing computational graphs, particularly designed for deep neural networks. Subgraphs is built with tensorflow.js, node, and react, and serves on Google Cloud. An instance of subgraphs is available at [https://www.subgraphs.com/](https://www.subgraphs.com/). 

See the [instructions](#install) below for local installation.

# Examples

## Building a simple graph
![Mnist Collage](https://imgur.com/0LL4HkC.gif)

## Training a convolutional neural network
![Convnet](https://imgur.com/ONTalkW.gif)

# <a name="install"></a>Installation

### Configuring the backend
Follow the [instructions here](https://cloud.google.com/appengine/docs/standard/nodejs/setting-up-environment) to create a google cloud project.

Run
```
gcloud auth application-default login
```

Create backend/src/config.json and set the specified values:
```
{
    "GCLOUD_PROJECT": "PROJECT_ID",
    "OAUTH2_CLIENT_ID": "GOOGLE_CLIENT_ID",
    "OAUTH2_CLIENT_SECRET": "GOOGLE_SECRET",
    "OAUTH2_CALLBACK": "/api/user/auth/google/callback",
    "SECRET": "SECRET"
}
```

### Install dependencies
```
npm install
```

## Run
```
npm start
```
