const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");
const { exec } = require("child_process");
const admin = require("firebase-admin");
const serviceAccount = require("../settings/managedb-9e0ed-firebase-adminsdk-ahr87-4e8fc08974.json");
const bcrypt = require("bcrypt");
const wifi = require("node-wifi");
const fs = require("fs");

app.disableHardwareAcceleration();
let mainWindow;

if (require("electron-squirrel-startup")) {
  app.quit();
}
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    //resizable: false,
    //minimizable: false,
    //movable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

// Evita que la ventana se minimice
// mainWindow.on('minimize', (event) => {
//   event.preventDefault();
// });

// Evita que la ventana se cierre
// mainWindow.on('close', (event) => {
//   event.preventDefault();
// });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  //mainWindow.setMenu(null);
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

ipcMain.on("poweroff", () => {
  powerOff();
});

ipcMain.on("launch-keyboard", (event, m) => {
  console.log("orden recibida:", m);
  //launchKeyboardForInputs();
});

function launchKeyboardForInputs() {
  exec("onboard", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error launching keyboard: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

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
        console.log("Conectado a la base de datos SQLite: " + DB_PATH);
      }
    });
  }

  getDatabase() {
    return this._db;
  }
}

const databaseManager = new DatabaseManager();

function executeSQLQuery(db, query, callback) {
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      callback(err, null);
    } else {
      //console.log("Filas retornadas:", rows.length);
      callback(null, rows);
    }
  });
}

const db = databaseManager.getDatabase();

function executeSQLQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const crypto = require('crypto');
const { markAsUntransferable } = require("node:worker_threads");

// Clave y vector de inicialización (IV) para AES (modifica estos valores según tu configuración)
const encryptionKey = Buffer.from('cec55c45e80c408482acf0589bde1631', 'utf8'); // 32 bytes para AES-256
const iv = Buffer.from('0123456789abcdef', 'utf8'); // 16 bytes para AES

// Función para desencriptar la contraseña
function decryptPassword(encryptedPassword) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Función para hashear la contraseña
function hashPassword(password) {
  const bytes = Buffer.from(password, 'utf8');

  const hash = crypto.createHash('sha256');
  hash.update(bytes);

  return hash.digest('hex');
}

let globalUserReceived = { usr: null, pass: null };

ipcMain.on("authentication", async (event, auth) => {
  const { usuario, contraseña } = auth;
  globalUserReceived.usr = usuario;
  globalUserReceived.pass = contraseña;

  try {
    const query = `SELECT username, password, role FROM users WHERE username = ?`;
    const params = [globalUserReceived.usr];
    const rows = await executeSQLQuery(db, query, params);

    let isPasswordMatch = false;

    console.log('ENTRANDO');
    if (rows.length > 0) {
      const user = rows[0];
      const userpass = user.password;

      const passHashed = hashPassword(userpass);
      const passReceHashed = hashPassword(globalUserReceived.pass);

      if (passReceHashed === userpass) {
        isPasswordMatch = true;
      }
      if (isPasswordMatch) {
        event.reply("login-result", {
          success: true,
          user: user.username,
          role: user.role,
        });
        console.log("Login exitoso");
      } else {
        event.reply("login-result", { success: false });
        console.log("Login fallido");
      }
    } else {
      event.reply("login-result", { success: false });
      console.log("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    event.reply("login-result", {
      success: false,
      message: "Error en el servidor",
    });
  }
});

function powerOff() {
  exec("sudo poweroff", (error) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error}`);
      return;
    }
  });
}

function getAllRegisters() {
  return new Promise((resolve, reject) => {
    const q = "SELECT * FROM register_date";
    db.all(q, function (error, rows) {
      if (error) {
        console.error("Error al obtener los datos: ", error);
        reject(error);
      } else {
        //console.log("Datos obtenidos de la tabla fecha: ", rows);
        resolve(rows);
      }
    });
  });
}

function getLastAssistance() {
  return new Promise((resolve, reject) => {
    const q = "SELECT * FROM assistance ORDER BY id DESC LIMIT 1";
    db.get(q, function (error, row) {
      if (error) {
        console.error(
          "Error al obtener el último registro de asistencia: ",
          error
        );
        reject(error);
      } else {
        //console.log("Último registro de asistencia obtenido: ", row);
        resolve(row);
      }
    });
  });
}

function insertRegisterDate(date) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO register_date VALUES (?, ?)";
    db.run(query, [null, date], function (err) {
      if (err) {
        console.error("Error al guardar la fecha: ", err);
        reject(err);
      } else {
        console.log("Fecha guardada: ", date);
        resolve(this.lastID);
      }
    });
  });
}

function insertAssistance(
  uid,
  name,
  surname,
  email,
  date,
  url,
  idRegisterDate
) {
  return new Promise((resolve, reject) => {
    const queryInsert = `INSERT INTO assistance (id, uid, name, surname, email, entry_date, photo, id_register_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      queryInsert,
      [null, uid, name, surname, email, date, url, idRegisterDate],
      function (err) {
        if (err) {
          console.error("Error al registrar la asistencia \n:", err);
          reject(err);
        } else {
          console.log("Asistencia guardada \n: ", {
            uid,
            name,
            surname,
            email,
            date,
            url,
          });
          resolve();
        }
      }
    );
  });
}

async function getAssistanceByUIDAndDate(uid, date) {
  const dateOnly = date.split(" ")[0];
  const query = `SELECT * FROM assistance WHERE UID = ? AND DATE(entry_date) = ?`;

  return new Promise((resolve, reject) => {
    db.get(query, [uid, dateOnly], (error, row) => {
      if (error) {
        console.error("Error al obtener la asistencia por UID y fecha: ", error);
        reject(error);
      } else {
        //console.log("Asistencia obtenida por UID y fecha: ", row);
        resolve(row);
      }
    });
  });
}

async function getOthersFields(emailR, answerR) {
  const query = `SELECT * FROM teachers WHERE email = ? AND answer = ?`;

  return new Promise((resolve, reject) => {
    db.get(query, [emailR, answerR], (error, row) => {
      if (error) {
        console.error("Error al obtener la asistencia por correo y respuesta: ", error);
        reject(error);
      } else {
        console.log("Asistencia obtenida por correo y respuesta: ", row);
        resolve(row);
      }
    });
  });
}

async function getQuestion(email) {
  const query = `SELECT question FROM teachers WHERE email = ?`;

  return new Promise((resolve, reject) => {
    db.get(query, [email], (error, row) => {
      if (error) {
        console.error("Error al obtener la pregunta: ", error);
        reject(error);
      } else {
        console.log("Pregunta obtenida por correo: ", row);
        resolve(row ? row.question : null);
      }
    });
  });
}

async function getRoleAdmin(UID) {
  const query = `SELECT role FROM users WHERE UID = ?`;

  return new Promise((resolve, reject) => {
    db.get(query, [UID], (error, row) => {
      if (error) {
        console.error("Error al obtener el rol: ", error);
        reject(error);
      } else {
        console.log("Rol obtenido por UID: ", row);
        resolve(row ? row.role : null);
      }
    });
  });
}

function base64ToImage(base64Image, filePath) {
  return new Promise((resolve, reject) => {
    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return reject(new Error('Invalid base64 string'));
    }
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
        console.log('foto guardada en: \n', filePath);
      }
    });
  });
}

async function isOnline() {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch("https://www.google.com", { method: 'HEAD' });
    console.log(`isOnline check status: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error("isOnline check failed:", error);
    return false;
  }
}

// const encryptedCode = 'qrsc';
// const key = 'cec55c45e80c408482acf0589bde1631';
// const iv = '00000000000000000000000000000000';

// const decryptedCode = CryptoJS.AES.decrypt(encryptedMessage, key).toString(CryptoJS.enc.Utf8);

let photoBase64 = null;

ipcMain.on("assistance", async (event, qrsc) => {
  try {
    console.log("Asistencia recibida: ", qrsc);
    const { uid, name, surname, email, date, url } = qrsc;
    const dateSplit = date.split(" ")[0];
    const entry_date = date;

    const registros = await getAllRegisters();

    let idRegisterDate = null;

    if (registros.length === 0) {
      idRegisterDate = await insertRegisterDate(dateSplit);
    } else {
      const lastAssistance = await getLastAssistance();
      if (
        lastAssistance &&
        lastAssistance.entry_date.split(" ")[0] === dateSplit
      ) {
        const lastRegisterDate = registros.find(
          (reg) => reg.date === dateSplit
        );
        idRegisterDate = lastRegisterDate
          ? lastRegisterDate.id
          : await insertRegisterDate(dateSplit);
      } else {
        idRegisterDate = await insertRegisterDate(dateSplit);
      }
    }

     photoBase64 = url;
    const screenshotsPath = path.resolve(__dirname, "../screenshots");
    const photoLocalPath = path.join(screenshotsPath, `${uid}-${dateSplit}.jpg`);

    await base64ToImage(photoBase64, photoLocalPath);

    const destinationPath = `photo_by_user/${uid}.jpg`;                  

    const existingAssistance = await getAssistanceByUIDAndDate(uid, date);

    const roleAdmin = await getRoleAdmin(uid);
    console.log('rol de admin', roleAdmin);

    if (existingAssistance) {
      console.log("Asistencia ya registrada...");
      const mssg = "Estimado docente, su asistencia ya ha sido registrada anteriormente";
      event.reply("assistance-reply", { success: false, message: mssg });
    } else {
      const onlineC = await isOnline();
      console.log(`Conexión a Internet: ${onlineC}`);

      if (onlineC) {
        await sendDataToFirestoreInstant(
          [{ date: dateSplit, id: idRegisterDate }],
          [{ uid, name, surname, email, entry_date, photoLocalPath, id_register_date: idRegisterDate }],
          event, // Pasa el evento aquí
          uid
        );

        await sendAttendanceToRealtimeDB(uid, date, name, surname, roleAdmin);

        await sendUsersToFirestoreToInstant(uid, entry_date, photoLocalPath);

        await uploadPhoto(photoLocalPath, destinationPath);

        event.reply("assistance-reply", {
          success: true,
          message: "Asistencia enviada a Firestore correctamente",
        });
      } else {
        await insertAssistance(
          uid,
          name,
          surname,
          email,
          date,
          photoLocalPath,
          idRegisterDate
        );
        event.reply("assistance-reply", {
          success: true,
          message: "Asistencia guardada localmente correctamente",
        });
      }
    }
  } catch (error) {
    console.error("Error en el proceso de asistencia: ", error);
    event.reply("assistance-reply", {
      success: false,
      message: "Error al registrar la asistencia",
    });
  }
});


ipcMain.on("setquestion", async (event, mail) => {
  try {
    const question = await getQuestion(mail);
    event.reply("thisIsTheQuestion", question);
  } catch (error) {
    console.error("Error al obtener la pregunta:", error);
    event.reply("thisIsTheQuestion", null);
  }
});

ipcMain.on("assistancemanual", async (event, data) => {
  try {
    //console.log("Asistencia manual recibida: ", data);
    const { email, entry_date, answer, photo } = data;
    const dateSplit = entry_date.split(" ")[0];

     const registros = await getAllRegisters();

     let idRegisterDate = null;

    if (registros.length === 0) {
      idRegisterDate = await insertRegisterDate(dateSplit);
    } else {
      const lastAssistance = await getLastAssistance();
      if (
        lastAssistance &&
        lastAssistance.entry_date.split(" ")[0] === dateSplit
      ) {
        const lastRegisterDate = registros.find(
          (reg) => reg.date === dateSplit
        );
        idRegisterDate = lastRegisterDate
          ? lastRegisterDate.id
          : await insertRegisterDate(dateSplit);
      } else {
        idRegisterDate = await insertRegisterDate(dateSplit);
      }
    }

    email_lower = email.toLowerCase();
    answer_lower = answer.toLowerCase();

    const nameSurnameAndUID = await getOthersFields(email_lower, answer_lower);

    const { name, surname, UID } = nameSurnameAndUID;

    const photoBase64 = photo;

    const screenshotsPath = path.resolve(__dirname, "../screenshots");
    const photoLocalPath = path.join(screenshotsPath, `${UID}-${dateSplit}.jpg`);
    const destinationPath = `photo_by_user/${UID}.jpg`;

    await base64ToImage(photoBase64, photoLocalPath);

    const existingAssistance = await getAssistanceByUIDAndDate(UID, entry_date);

    const roleAdmin = await getRoleAdmin(UID);
    console.log('rol de admin', roleAdmin);

    if (existingAssistance) {
      console.log("asistencia manual ya registrada.... XD");
      const mssg =
        "Estimado docente, su asistencia manual ya ha sido registrada anteriormente";
      event.reply("assistance-manual-reply", { success: false, message: mssg });
    } else {
      const onlineM = await isOnline();
      console.log(`Conexion a Internet: ${onlineM}`);

      if (onlineM) {
        await sendDataToFirestoreInstant(
          [{ date: dateSplit, id: idRegisterDate }],
          [{ UID, name, surname, email, entry_date, photoLocalPath, id_register_date: idRegisterDate }], event, UID
        );
        
        await uploadPhoto(photoLocalPath, destinationPath);
        
        await sendAttendanceToRealtimeDB(UID, entry_date, name, surname, roleAdmin);

        await sendUsersToFirestoreToInstant(UID, entry_date);

        event.reply("assistance-manual-reply", {
          success: true,
          message: "Asistencia manual enviada a Firestore correctamente",
        });
      } else {
        await insertAssistance(
          UID,
          name,
          surname,
          email,
          entry_date,
          photoLocalPath,
          idRegisterDate
        );
        event.reply("assistance-manual-reply", {
          success: true,
          message: "Asistencia manual guardada en local correctamente",
        });
      }
      
    }
  } catch (error) {
    console.error("Error en el proceso de asistencia manual: ", error);
    event.reply("assistance-manual-reply", {
      success: false,
      message: "Error al registrar la asistencia\n",
    });
  }
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://recdat-device.appspot.com",
  databaseURL: "https://recdat-device-default-rtdb.firebaseio.com/"
});

const dbfs = admin.firestore();
const bucket = admin.storage().bucket();
const dbRealtime = admin.database();

async function sendUsersToFirestoreToInstant(UID, entry_date, photoLocalPath) {
  try {
    const batch = dbfs.batch();

      const userId = UID;
      const createdAt = entry_date;
      const docRef = dbfs.collection("users").doc(userId.toString());
      const attendance = {
        title: "ASISTENCIA",
        description: "N/A",
        createdAt: createdAt,
        type: "ATTENDANCE",
        uuid: UID
      };

    const destinationPath = `photo_by_user/${attendance.uuid}.jpg`;
    await uploadPhoto(photoLocalPath, destinationPath);                  

      const doc = await docRef.get();
      if (doc.exists) {
        batch.update(docRef, {
          attendances: admin.firestore.FieldValue.arrayUnion(attendance),
        });
      } else {
        batch.set(docRef, {
          userId: userId,
          attendances: [attendance],
        });
      }

    await batch.commit();
    console.log("Todos los documentos de usuarios actualizados con éxito.");
  } catch (error) {
    console.error("Error al actualizar documentos de usuarios:", error);
  }
}

async function sendDataToFirestoreInstant(fechaRegistros, asistenciaRegistros, event, uid) {
  const batch = dbfs.batch();
  const collectionRef = dbfs.collection("assistances");

  for (const fecha of fechaRegistros) {
    const docRef = collectionRef.doc(fecha.date);
    const asistencias = asistenciaRegistros.filter(
      (asistencia) => asistencia.id_register_date === fecha.id
    );

    const cleanedAsistencias = asistencias.map(
      ({ id_register_date, ...rest }) => rest
    );

    try {
      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        const asistenciasArray = data.asistencias || [];
        const uidExists = asistenciasArray.some(asistencia => asistencia.uid === uid);

        if (uidExists) {
          event.reply("assistance-reply", {
            success: false,
            message: `Su asistencia ya ha sido registrada anteriormente...`,
          });
        } else {
          asistenciasArray.push(...cleanedAsistencias);
          batch.update(docRef, { asistencias: asistenciasArray });
        }
      } else {
        batch.set(docRef, { date: fecha.date, asistencias: cleanedAsistencias });
      }
    } catch (error) {
      console.error(`Error al procesar la fecha ${fecha.date}:`, error);
    }
  }

  try {
    await batch.commit();
    console.log("Batch commit successful.");
  } catch (error) {
    console.error("Error during batch commit:", error);
  }
}

async function sendAttendanceToRealtimeDB(UID, entry_date, name, surname, role) {
  try {
    const userId = UID;
    const createdAt = entry_date;
    const firstName = name;
    const lastName = surname;
    const uuids = generateUUID();

    let attendance = null;
    if (role === 'admin') {
       attendance = {
        body: `Hola admin, haz realizado tu registro.`,
        title: "Registro de ingreso",
        createdAt: createdAt,
        createdBy: userId,
        uuid: uuids
      };
    } else {
       attendance = {
        body: `El profesor ${firstName} ${lastName} realizó su registro.`,
        title: "Registro de ingreso",
        createdAt: createdAt,
        createdBy: userId,
        uuid: uuids
      };
    }

    const dateKey = createdAt.split(" ")[0];
    const teacherRef = dbRealtime.ref(`${dateKey}/${userId}/attendances/${uuids}`);

    console.log(attendance);
    await teacherRef.set(attendance);

    console.log("Todos los registros de asistencia se han enviado con éxito a Realtime Database.");
  } catch (error) {
    console.error("Error al enviar los registros de asistencia a Realtime Database:", error);
  }
}

async function sendAllAttendancesToRealtimeDB() {
  try {
    const asistenciaRows = await new Promise((resolve, reject) => {
      const query = "SELECT UID, entry_date, name, surname FROM assistance";
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    for (const row of asistenciaRows) {
      const userId = row.UID;
      const createdAt = row.entry_date;
      const firstName = row.name;
      const lastName = row.surname;
      const uuidg = generateUUID();

      const attendance = {
        body: `El profesor ${firstName} ${lastName} realizó su registro.`,
        title: "Registro de ingreso",
        createdAt: createdAt,
        createdBy: userId,
        uuid: uuidg
      };

      const dateKey = createdAt.split(' ')[0];
      const teacherRef = dbRealtime.ref(`${dateKey}/${userId}/attendances/${uuidg}`);

      await teacherRef.set(attendance);
    }

    console.log("Todos los registros de asistencia se han enviado con éxito a Realtime Database.");
  } catch (error) {
    console.error("Error al enviar los registros de asistencia a Realtime Database:", error);
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function syncAdminsToLocalDB() {
  try {
    const snapshot = await dbfs.collection('users').where('rol', '==', 'admin').get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      snapshot.forEach(doc => {
        const userData = doc.data();

        const UID = userData.uid || 'noSet';
        const username = userData.email || 'noSet';
        const passw = userData.password || 'noSet';
        const role = userData.rol || 'noSet';

        db.get('SELECT * FROM users WHERE uid = ?', [UID], (err, row) => {
          if (err) {
            return console.error(err.message);
          }

          if (!row) {
            db.run(`INSERT INTO users (id, uid, username, password, role)
                    VALUES (?, ?, ?, ?, ?)`, [null, UID, username, passw, role], function (err) {
              if (err) {
                return console.error(err.message);
              }
              console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
          } else {
            if (row.username !== username || row.password !== passw || row.role !== role) {

              db.run(`UPDATE users
                      SET username = ?, password = ?, role = ? WHERE uid = ?`, [username, passw, role, UID], function (err) {
                if (err) {
                  return console.error(err.message);
                }
                console.log(`Row with UID ${UID} has been updated`);
              });
            } else {
              console.log(`No changes for user with UID ${UID}`);
            }
          }
        });
      });

      db.run('COMMIT', (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Transaction committed.');
      });
    });

  } catch (err) {
    console.error('Error reading from Firestore or writing to SQLite:', err);
  }
}

syncAdminsToLocalDB();

setInterval(() => {
  syncAdminsToLocalDB();
}, 13000);

async function syncUsersToTeachers() {
  try {
    const snapshot = await dbfs.collection('users').get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      snapshot.forEach(doc => {
        const userData = doc.data();
        const UID = userData.uid || '';
        const name = userData.name || '';
        const surname = userData.surname || '';
        const email = userData.email || '';
        const phone = userData.phone || null;
        const question = userData.question || '';
        const answer = userData.answer || '';

        db.get('SELECT * FROM teachers WHERE uid = ?', [UID], (err, row) => {
          if (err) {
            return console.error(err.message);
          }
          
          if (!row) {
            db.run(`INSERT INTO teachers (id, uid, name, surname, email, phone, question, answer)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [null, UID, name, surname, email, phone, question, answer], function(err) {
              if (err) {
                return console.error(err.message);
              }
              console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
          } else {
            
            if (row.name !== name || row.surname !== surname || row.email !== email || 
                row.phone !== phone || row.question !== question || row.answer !== answer) {
              
              db.run(`UPDATE teachers
                      SET name = ?, surname = ?, email = ?, phone = ?, question = ?, answer = ?
                      WHERE uid = ?`, [name, surname, email, phone, question, answer, UID], function(err) {
                if (err) {
                  return console.error(err.message);
                }
                console.log(`Row with UID ${UID} has been updated`);
              });
            } else {
              console.log(`No changes for user with UID ${UID}`);
            }
          }
        });
      });

      db.run('COMMIT', (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Transaction committed.');
      });
    });

  } catch (err) {
    console.error('Error reading from Firestore or writing to SQLite:', err);
  }
}

async function uploadPhoto(localPath, destinationPath) {
  try {
    await bucket.upload(localPath, {
      destination: destinationPath,
    });

    console.log(`${localPath} subido a ${destinationPath}.`);
    await bucket.file(destinationPath).makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
    return publicUrl;
  } catch (error) {
    console.error("Error subiendo la foto:", error);
    throw error;
  }
}

async function uploadAllPhotos() {
  const directoryPath = path.resolve(__dirname, "../screenshots");
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const destinationPath = `photo_by_user/${file}`;

      const photoURL = await uploadPhoto(filePath, destinationPath);
      console.log(`Archivo ${file} subido correctamente. URL: ${photoURL}`);

      fs.unlinkSync(filePath);
      console.log(`Archivo ${file} eliminado correctamente.`);
    }
  } catch (error) {
    console.error("Error subiendo las fotos:", error);
    throw error;
  }
}

syncUsersToTeachers();

setInterval(() => {
  syncUsersToTeachers();
}, 5000);

// async function sendDataToFirestoreInstant(fechaRegistros, asistenciaRegistros, event) {
//   const batch = dbfs.batch();
//   const collectionRef = dbfs.collection("assistances");

//   for (const fecha of fechaRegistros) {
//     const docRef = collectionRef.doc(fecha.date);
//     const asistencias = asistenciaRegistros.filter(
//       (asistencia) => asistencia.id_register_date === fecha.id
//     );

//     const cleanedAsistencias = asistencias.map(
//       ({ id_register_date, ...rest }) => rest
//     );

//     try {
//       const docSnapshot = await docRef.get();
//       if (docSnapshot.exists) {
//         event.reply("assistance-reply", {
//           success: true,
//           message: `El documento para la fecha ${fecha.date} ya existe y no será actualizado.`,
//         });
//       } else {
//         batch.set(docRef, { date: fecha.date, asistencias: cleanedAsistencias });
//       }
//     } catch (error) {
//       console.error(`Error al procesar la fecha ${fecha.date}:`, error);
//     }
//   }

//   try {
//     await batch.commit();
//     console.log("Batch commit successful.");
//   } catch (error) {
//     console.error("Error during batch commit:", error);
//   }
// }


async function clearTableAssistance() {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM assistance";
    db.run(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function clearTableRegisterDate() {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM register_date";
    db.run(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function consultarFechas() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM register_date";
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function consultarRegistrosLocal() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM assistance";
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function sendDataToFirestore(fechaRegistros, asistenciaRegistros) {
  const batch = dbfs.batch();
  const collectionRef = dbfs.collection("assistances");

  for (const fecha of fechaRegistros) {
    const docRef = collectionRef.doc(fecha.date);
    const asistencias = asistenciaRegistros.filter(
      (asistencia) => asistencia.id_register_date === fecha.id
    );

    const cleanedAsistencias = asistencias.map(
      ({ id_register_date, ...rest }) => rest
    );

    try {
      const docSnapshot = await docRef.get();
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        const updatedAsistencias = [...data.asistencias, ...cleanedAsistencias];
        batch.update(docRef, { asistencias: updatedAsistencias });
      } else {
        batch.set(docRef, { date: fecha.date, asistencias: cleanedAsistencias });
      }
    } catch (error) {
      console.error(`Error al procesar la fecha ${fecha.date}:`, error);
    }
  }

  try {
    await batch.commit();
    console.log("Batch commit successful.");
  } catch (error) {
    console.error("Error during batch commit:", error);
  }
}

async function sendUsersToFirestore() {
  try {
    const asistenciaRows = await new Promise((resolve, reject) => {
      const query = "SELECT UID, entry_date FROM assistance";
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const batch = dbfs.batch();

    for (const row of asistenciaRows) {
      const userId = row.UID;
      const createdAt = row.entry_date;
      const docRef = dbfs.collection("users").doc(userId.toString());
      const attendance = {
        title: "ASISTENCIA",
        description: "N/A",
        createdAt: createdAt,
        type: "ATTENDANCE",
        uuid: generateUUID()
      };

      const doc = await docRef.get();
      if (doc.exists) {
        batch.update(docRef, {
          attendances: admin.firestore.FieldValue.arrayUnion(attendance),
        });
      } else {
        batch.set(docRef, {
          userId: userId,
          attendances: [attendance],
        });
      }
    }

    await batch.commit();
    console.log("Todos los documentos de usuarios se han actualizado o creado con éxito.");
  } catch (error) {
    console.error("Error al actualizar o crear documentos de usuarios:", error);
  }
}

async function syncronizeAndClean() {
  try {
    const [fechaRegistros, asistenciaRegistros] = await Promise.all([
      consultarFechas(),
      consultarRegistrosLocal(),
    ]);

    await sendDataToFirestore(fechaRegistros, asistenciaRegistros);

    await sendUsersToFirestore();

    await sendAllAttendancesToRealtimeDB();

    await clearTableAssistance();

    await clearTableRegisterDate();

    await uploadAllPhotos();

    console.log("Proceso de migración completado correctamente.");
  } catch (error) {
    console.error("Error durante la migración de datos:", error);
  }
}

ipcMain.on("confim", async (event, scs) => {
  console.log("Mensaje de confirmacion: ", scs);

  const onlineCo = await isOnline();
  console.log(`Conexion a Internet: ${onlineCo}`);
  
  if (onlineCo) {
    syncronizeAndClean();
    event.reply("reply-fedd-sync", {
      success: true,
      message: "Sincronización exitosa, todo actualizado.",
    });
  } else {
    event.reply("reply-fedd-sync", {
      success: false,
      message: "Error al sincronizar, por favor revisa tu conexión a internet",
    });
  }
});

wifi.init({
  iface: null,
});

ipcMain.handle("list-wifi-networks", async () => {
  try {
    const networks = await wifi.scan();
    return networks;
  } catch (error) {
    console.error("Error al escanear redes WiFi:", error);
    throw error;
  }
});

ipcMain.handle("connect-wifi", async (event, ssid, password) => {
  console.log('Credenciales:\n ', '\nSSID: ', ssid, '\npassword: ', password);
  try {
    await wifi.connect({ ssid, password });
    return true;
  } catch (error) {
    console.error("Error al conectarse a la red WiFi:", error);
    throw error;
  }
});

async function consultarRegistrosLocalParaColores() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM assistance";
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        if (rows.length === 0) {
          var color = "#0080ff";
          console.log("color a enviar: ", color);
          mainWindow.webContents.send("change-color", color);
        } else {
          var color = "#009933";
          console.log("color a enviar: ", color);
          mainWindow.webContents.send("change-color", color);
        }
        resolve(rows);
      }
    });
  });
}

setInterval(() => {
  consultarRegistrosLocalParaColores();
}, 300000);

