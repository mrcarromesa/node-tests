import database from '../../src/database'; // importamos todos os models que estão no arquivo index.js dessa pasta importada

export default function truncate() {
  // Nos permite ter varios async await
  return Promise.all(
    Object.keys(database.connection.models).map(key => {
      return database.connection.models[key].destroy({
        truncate: true,
        force: true,
      });
    })
  );
}
