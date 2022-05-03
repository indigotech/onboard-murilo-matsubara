# Onboard Murilo Matsubara

Onboard backend project to get familiar with Taqtile's workflow and projects best practices.

---

## Running the server

To run the server, you need first to have node.js installed on your machine. After that, you can follow the steps bellow:

### 1. Environment

Edit `sample.env` file to your liking and then rename it to `.env`. After that you can startup the required containers executing the following command:

```
docker-compose up
```

### 2. Install dependencies

```
npm install
```

### 3. Transpile typescript files to javascript

```
npm run build
```

### 4. Run the server

```
npm start
```
