import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Budget, BudgetData } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public dataChange: Subject<Budget> = new Subject<Budget>();

  private data: Budget | null = null;
  private dataRequested: boolean = false;

  private dataSource: BudgetData = {
    datasets: [
        {
            data: [],
            backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
                '#bf2a77',
                '#bf2a2c',
                '#bc2abf'
            ]
        }
    ],
    labels: []
  };

  public getDataSource(): BudgetData {
    return this.dataSource;
  }

  constructor(private http: HttpClient) {
    // Only make a backend call if the data isn't populated yet
    if (!this.dataRequested) {
      this.http.get<Budget>("http://localhost:3000/budget").subscribe((res: Budget) => {
        this.dataRequested = true;
        this.data = res;

        for (var i = 0; i < this.data.myBudget.length; i++) {
          this.dataSource.datasets[0].data[i] = this.data.myBudget[i].budget;
          this.dataSource.labels[i] = this.data.myBudget[i].title;
        }

        this.dataChange.next(this.data);
      });
    }
  }
}
