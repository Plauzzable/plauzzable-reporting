
const parseDatabaseConfig = (database, pgSchema) => {
    let parts = database.split("|");
    let host = parts[0];
    let port = parts[1];
    let user = parts[2];
    let password = parts[3];
    return {
      user,
      host,
      database: pgSchema,
      password,
      port,
    };
  };
  
  export { parseDatabaseConfig };