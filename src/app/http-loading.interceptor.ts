import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoaderService } from './global-loader.service';

export const httpLoadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loader = inject(GlobalLoaderService);
  const url = request.url.toLowerCase();
  let message = 'Loading records…';

  if (url.includes('/import')) message = 'Uploading and validating records…';
  else if (url.includes('/template')) message = 'Preparing template download…';
  else if (url.includes('/export') || request.responseType === 'blob')
    message = 'Preparing your download…';
  else if (url.includes('verify-company')) message = 'Searching company records…';
  else if (request.method === 'DELETE') message = 'Removing selected records…';
  else if (request.method !== 'GET') message = 'Saving your changes…';

  const taskId = loader.begin(message);
  return next(request).pipe(finalize(() => loader.end(taskId)));
};
