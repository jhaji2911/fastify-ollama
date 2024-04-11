# 
# OLLAMA API Wrapper

This is a simple fastify wrapper of the ollama API.

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Contributing](#contributing)

## About <a name = "about"></a>

This project is just wrapper, which calls the underlying  `ollama api` for getting data from existing models running in your local or hosted machines.

 You need to install and run ollama api before using this wrapper. 

 ## Usage <a name = "usage"></a>

Steps to install `ollama`

1. First download ollama from [here](https://ollama.com/download)
2. once you have downloaded ollama, then proceed with downloading models and running them.
3. In our case we have two models running : 
                a. `ollama run mistral:7b-instruct`
                b. `ollama run deepseek-coder:6.7b`

 Well, this is it for the ollama part.





## Getting Started <a name = "getting_started"></a>

Now you can start using this wrapper by installing it via npm/yarn:

1. just clone the repo and install dependencies.
2. you can also view swagger documentation at `http://localhost:3000/docs`


⚠️ Rate limitting is implemented on this wrapper, so that you don't blow of your systems, you can increase or remove it from in `app.ts`  file. 

### Prerequisites

What things you need to install the software and how to install them.

```
node >= 18 
```

### Installing



```
yarn
```

And run it for local env

```
yarn dev
```

## Contributing <a name = "contributing"></a>

Pull requests are welcome. This is small project we can make something good out of it.
