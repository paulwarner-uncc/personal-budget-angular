import { Component } from '@angular/core';

@Component({
  selector: 'pb-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'personal-budget';
}
export interface BudgetCategory {
  title: string,
  budget: number
};
export interface Budget {
  myBudget: BudgetCategory[]
};
export interface BudgetData {
  datasets: [
    {
      data: number[],
      backgroundColor: string[]
    }
  ],
  labels: string[]
}
