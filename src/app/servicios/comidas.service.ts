import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Plato } from '../entidades/platos';
import { Resumen } from '../entidades/resumen';
import { Destacado } from '../entidades/destacado';
import { interseccion, precioAleatorio, resumirTexto } from './Utilidades';

@Injectable({ 
  providedIn: 'root' 
})

export class ComidasService {
  private url = 'https://www.themealdb.com/api/json/v1/1';
  private cache = new Map<string, Plato>();

  constructor(private http: HttpClient) {}

  categorias(): Observable<string[]> {
    return this.http.get<any>(`${this.url}/categories.php`).pipe(
      map(r => (r.categories ?? []).map((c: any) => c.strCategory as string)),
      catchError(() => of([]))
    );
  }

  porCategoria(categoria: string): Observable<Resumen[]> {
    return this.lista('filter.php', { c: categoria });
  }

  porIngrediente(ingrediente: string): Observable<Resumen[]> {
    return this.lista('filter.php', { i: ingrediente.replace(/\s+/g, '_') });
  }

  porNombre(nombre: string): Observable<Resumen[]> {
    return this.http.get<any>(`${this.url}/search.php`, { params: { s: nombre } }).pipe(
      map(r => {
        const comidas: any[] = Array.isArray(r?.meals) ? r.meals : [];
        return comidas.map(m => {
          const plato = this.aPlato(m);
          return { id: plato.id, nombre: plato.nombre, imagen: plato.imagen };
        });
      }),
      catchError(() => of([]))
    );
  }

  buscar(nombre: string, ingrediente: string): Observable<Resumen[]> {
    const consultas: Observable<Resumen[]>[] = [];
    if (nombre) {
      consultas.push(this.porNombre(nombre));
    }
    if (ingrediente) {
      consultas.push(this.porIngrediente(ingrediente));
    }
    if (consultas.length === 0) {
      return of([]);
    }
    return forkJoin(consultas).pipe(map(listas => interseccion(listas)));
  }

  detalles(ids: string[]): Observable<Plato[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const peticiones: Observable<Plato | null>[] = ids.map(id => {
      const guardado = this.cache.get(id);
      if (guardado) {
        return of(guardado);
      }
      return this.http.get<any>(`${this.url}/lookup.php`, { params: { i: id } }).pipe(
        map(r => (r?.meals?.[0] ? this.aPlato(r.meals[0]) : null)),
        catchError(() => of(null))
      );
    });
    return forkJoin(peticiones).pipe(
      map(platos => platos.filter((p): p is Plato => p !== null))
    );
  }

  // Plato destacado para el inicio
  platoEstrella(nombre: string): Observable<Destacado | null> {
    return this.http.get<any>(`${this.url}/search.php`, { params: { s: nombre } }).pipe(
      map(r => this.aDestacado(r?.meals?.[0])),
      catchError(() => of(null))
    );
  }

  // Plato al azar para el juego
  platoAleatorio(): Observable<Destacado | null> {
    return this.http.get<any>(`${this.url}/random.php`).pipe(
      map(r => this.aDestacado(r?.meals?.[0])),
      catchError(() => of(null))
    );
  }

  private lista(ruta: string, parametros: Record<string, string>): Observable<Resumen[]> {
    return this.http.get<any>(`${this.url}/${ruta}`, { params: parametros }).pipe(
      map(r => {
        const comidas: any[] = Array.isArray(r?.meals) ? r.meals : [];
        return comidas.map(m => ({ id: m.idMeal, nombre: m.strMeal, imagen: m.strMealThumb }));
      }),
      catchError(() => of([]))
    );
  }

  private aDestacado(m: any): Destacado | null {
    if (!m) {
      return null;
    }
    const plato = this.aPlato(m);
    return new Destacado(m.strMeal, resumirTexto(m.strInstructions), m.strMealThumb, plato.id, plato.precio);
  }

  private aPlato(m: any): Plato {
    const guardado = this.cache.get(m.idMeal);
    if (guardado) {
      return guardado;
    }
    const ingredientes: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingrediente = m['strIngredient' + i];
      if (ingrediente && ingrediente.trim() !== '') {
        ingredientes.push(ingrediente.trim());
      }
    }
    const plato = new Plato(
      m.idMeal,
      m.strMeal,
      m.strCategory,
      Array.from(new Set(ingredientes)),
      precioAleatorio(),
      m.strMealThumb
    );
    this.cache.set(plato.id, plato);
    return plato;
  }
}