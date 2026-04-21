import { HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../busy-service';
import { finalize, delay } from 'rxjs';
import { inject } from '@angular/core';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);
  busyService.busy();
  return next(req).
  pipe(delay(3000), 
  finalize(() => busyService.idle())
  );
};
