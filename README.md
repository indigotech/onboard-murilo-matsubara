# Onboard Murilo Matsubara

Onboard backend project to get familiar with Taqtile's workflow and projects best practices.

---

## Running the server

To run the server, you need first to have node.js installed on your machine. After that, you can follow the steps bellow:

### 1. Environment

Make a copy of `sample.env` with the name `.env`, then modify `.env` to your liking. If you plan to add a new environment variable, make sure to update the `sample.env` file.

### 2. Infra

To startup the required containers to run the project, execute the following command:

```
npm run infra
```

### 3. Install dependencies

```
npm install
```

### 4. Transpile typescript files to javascript

```
npm run build
```

### 5. Run the server

```
npm start
```
