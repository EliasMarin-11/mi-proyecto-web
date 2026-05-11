import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private dbName: string = 'nevera_favoritos_db';

  constructor() {}

  // 1. Inicializar la base de datos
  async initializePlugin(): Promise<void> {
    try {
      // Creamos la conexión (Nombre, encriptado, modo, version, solo lectura)
      this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);

      // Abrimos la base de datos
      await this.db.open();

      // Creamos las tablas necesarias
      await this.createSchema();
      console.log('Base de datos local inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando SQLite:', error);
    }
  }

  // 2. Crear la estructura (Tabla)
  private async createSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS favoritos (
        id TEXT PRIMARY KEY NOT NULL
      );
    `;
    await this.db.execute(schema);
  }

  // --- OPERACIONES CRUD ---

  // Añadir a favoritos
  async addFavorito(id: string): Promise<void> {
    const query = `INSERT OR IGNORE INTO favoritos (id) VALUES (?)`;
    await this.db.run(query, [id]);
  }

  // Quitar de favoritos
  async removeFavorito(id: string): Promise<void> {
    const query = `DELETE FROM favoritos WHERE id = ?`;
    await this.db.run(query, [id]);
  }

  // Comprobar si una receta es favorita (Para el botón del detalle)
  async isFavorito(id: string): Promise<boolean> {
    const query = `SELECT id FROM favoritos WHERE id = ?`;
    const result = await this.db.query(query, [id]);
    return (result.values && result.values.length > 0) ? true : false;
  }

  // Obtener todos los IDs de favoritos (Para la lista de la pantalla Favoritos)
  async getFavoritosIds(): Promise<string[]> {
    const query = `SELECT id FROM favoritos`;
    const result = await this.db.query(query);

    if (result.values && result.values.length > 0) {
      return result.values.map(row => row.id);
    }
    return [];
  }
}
