import { TestBed } from '@angular/core/testing';

import { Recetas } from './recetas';

describe('Recetas', () => {
  let service: Recetas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recetas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
