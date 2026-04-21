import { inject, Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  busyRequestCount = 0;
  spinner = inject(NgxSpinnerService);

  busy(){
    this.busyRequestCount ++;
    this.spinner.show(undefined,
      {
        type: 'ball-scale-ripple',
        bdColor: 'rgba(0,0,0,0.3)',
        color: '#fff',
        size: 'large'
      }
    );
  }
  
  idle(){
    this.busyRequestCount--;
    if(this.busyRequestCount <= 0){
      this.busyRequestCount = 0;
      this.spinner.hide();
    }
  }
}
