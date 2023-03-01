
const parseDatabaseConfig = (database) => {
    let parts = database.split("|");
    let host = parts[0];
    let port = parts[1];
    let user = parts[2];
    let password = parts[3];
    return {
      user,
      host,
      database: "ms-users",
      password,
      port,
    };
  };
  
  export { parseDatabaseConfig };