const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");
const { exec } = require('child_process');

if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1048,
    height: 624,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js")
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  //mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

if (process.env.NODE_ENV !== "production") {
  require("electron-reloader")(module);
  electron: path.join(__dirname, "../node_modules", ".bin", "electron");
}

ipcMain.on("poweroff", (event, pw) =>{
  console.log("apagando...", pw);
  powerOff();
})

//========================= >>>TODO EL METODO A LA CONEXION<<< =========================//
class DatabaseManager {
  constructor() {
    if (!DatabaseManager.instance) {
      this._db = this._connectToDatabase();
      DatabaseManager.instance = this;
    }

    return DatabaseManager.instance;
  }

  _connectToDatabase() {
    const DB_PATH = "database/assistances.db";
    return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("Error al abrir la base de datos: =======>", err.message);
      } else {
        console.log("Conectado a la base de datos SQLite: "+ DB_PATH);
      }
    });
  }

  getDatabase() {
    return this._db;
  }
}

const databaseManager = new DatabaseManager();

//========================= >>>TODA LA LOGICA DE FUNCIONES A LA BD<<< =========================//

function executeSQLQuery(db, query, callback) {
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err, null);
    } else {
      console.log("Filas retornadas:", rows.length);
      callback(null, rows);
    }
  });
}

let globalUsers = [];

const db = databaseManager.getDatabase();

let query = 'SELECT * FROM users';

let globalUserReceived = {usr: null, pass: null};

ipcMain.on("authentication", (event, auth) => {
  const {usuario, contraseña} = auth
  globalUserReceived.usr = usuario;
  globalUserReceived.pass = contraseña;
  console.log('usuario recibido: ', globalUserReceived.usr, globalUserReceived.pass);

  const user = globalUsers.find(user => user.username === globalUserReceived.usr && user.password === globalUserReceived.pass);
  if (user) {
    event.reply('login-result', { success: true, user: user.username, role: user.role });
    console.log('login exitoso');
  } else {
    event.reply('login-result', { success: false });
    console.log('login fallido');
  }
})

executeSQLQuery(db, query, (err, users) => {
  if (err) {
    console.error('Error al ejecutar la consulta:', err);
  } else {
    globalUsers = users;
    console.log('Usuarios:', globalUsers);
  }
});
 

function powerOff() {
  exec("shutdown -s -f -t 5", (error) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error}`);
      return;
    }
  });
}



