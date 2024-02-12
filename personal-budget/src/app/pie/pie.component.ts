import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { Budget, BudgetCategory } from '../app.component';
import * as d3 from 'd3';

// Based on https://blog.logrocket.com/data-visualization-angular-d3-js/#creating-pie-chart

@Component({
  selector: 'pb-pie',
  templateUrl: './pie.component.html',
  styleUrl: './pie.component.scss'
})
export class PieComponent implements OnInit {
  constructor(private dataService: DataService) {
  }

  private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null;
  private pie: d3.Pie<any, number | { valueOf(): number; }> | null = null;
  public static arc: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private outerArc: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private slice: d3.Selection<d3.BaseType, d3.PieArcDatum<number | {valueOf(): number;}>, d3.BaseType, unknown> | null = null;

  private readonly width = 475;
  private readonly height = 325;
  private readonly radius = Math.min(this.width, this.height) / 2;

  private key(d: any) {
    return d.data.title;
  }

  private subscription: Subscription | null = null;

  ngOnInit(): void {
    this.subscription = this.dataService.dataChange.subscribe((budget: Budget) => {
      this.createChart(budget);
    });
  }

  createChart(budget: Budget): void {
    let data = this.dataService.getDataSource();

    this.createCoolerElement();

    let color = d3.scaleOrdinal()
      .domain(data.labels)
      .range(data.datasets[0].backgroundColor);

    /*
    private key(d: any) {
      return d.data.title;
    }
    */

    /* ------- PIE SLICES -------*/
    // Convert the budget info to arrays
    let budgetNumbers: number[] = [];

    let budgetTitles: string[] = [];
    budget.myBudget.forEach(v => {
      budgetNumbers.push(v.budget);
      budgetTitles.push(v.title);
    });

    // From https://stackoverflow.com/a/16751601
    // Consecutively add each number in the array
    let sum = budgetNumbers.reduce((partialSum, a) => partialSum + a, 0);

    // Calculate the proportion that each wedge takes up
    let budgetProportion: number[] = [];
    for (let i = 0; i < budgetNumbers.length; i++) {
      if (i === 0) {
        budgetProportion.push(0);
      } else {
        budgetProportion.push(budgetProportion[i - 1] + (2*Math.PI * budgetNumbers[i - 1] / sum));
      }
    }

    // Get all the slices and populate with data
    this.slice = this.svg!.select(".slices").selectAll("path.slice")
      .data(this.pie!(budgetNumbers));

    // Fill each pie wedge with the correct color
    this.slice!.enter()
      .insert("path")
      .style("fill", function(d) {
        let i = budgetNumbers.indexOf(d.data as number);
        return color(budgetTitles[i]) as string;
      })
      .attr("class", "slice");

    // Use the transition animations to correctly position the slices
    // TODO: clean up this typing when everything inevitably breaks
    /* this.slice!.transition()
      .attrTween("d", function(this: any, d: any) {
        console.log("this:", this);
        console.log("d:", d);

        (this as any)._current = (this as any)._current || d;
        var interpolate = d3.interpolate((this as any)._current, d);
        (this as any)._current = interpolate(0);
        return function(t: number) {
          return PieComponent.arc!(interpolate(t) as any);
        }
      } as any); */

    this.svg!.select(".slices").selectAll("path.slice").transition()
      .attrTween("d", function(this: any, d: any) {
        let i = budgetNumbers.indexOf(d.data as number);
        let c = budgetNumbers.length;
        //console.log(2*Math.PI * i / c, 2*Math.PI * (i + 1) / c);

        if (isNaN(d.value)) {
          d.value = d.data;
        }
        if (d.endAngle === 0) {
          d.startAngle = budgetProportion[i];
          d.endAngle = budgetProportion[i % budgetNumbers.length];

          if (i == budgetNumbers.length - 1) {
            d.endAngle = 2*Math.PI;
          }
        }

        (this as any)._current = (this as any)._current || d;
        let interpolate_start = d3.interpolate((this as any)._current, d);
        var interpolate = (t: number) => {
          let temp = interpolate_start(t);

          temp.startAngle = budgetProportion[temp.index];
          temp.stopAngle = budgetProportion[temp.index + 1 % budgetProportion.length];
          if (temp.index === budgetProportion.length - 1) {
            temp.stopAngle = Math.PI * 2;
          }

          console.log(temp);
          return temp;
        }

        console.log(interpolate(0));

        (this as any)._current = interpolate(0);
        return function(t: number) {
          return PieComponent.arc!(interpolate(t) as any);
        }
      } as any);

    this.slice!.exit()
        .remove();

    return;

    /* ------- TEXT LABELS -------*/

    var text = this.svg!.select(".labels").selectAll("text")
        .data(this.pie!(data as any), this.key);

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data as any).title;
        });

    function midAngle(d: d3.PieArcDatum<number | {valueOf(): number;}>){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    // Makes sure the text is place correctly
    text.transition()
        .attrTween("transform", function(d) {
            (this as any)._current = (this as any)._current || d;
            var interpolate = d3.interpolate((this as any)._current, d);
            (this as any)._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = (this as any).outerArc.centroid(d2);
                pos[0] = (this as any).radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            (this as any)._current = (this as any)._current || d;
            var interpolate = d3.interpolate((this as any)._current, d);
            (this as any)._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = this.svg!.select(".lines").selectAll("polyline")
        .data(this.pie!(data as any), this.key);

    polyline.enter()
        .append("polyline");

    polyline.transition()
        .attrTween("points", function(this: any, d: any){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(this: any, t: number) {
                var d2 = interpolate(t);
                var pos = this.outerArc.centroid(d2);
                pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [this.arc.centroid(d2), this.outerArc.centroid(d2), pos];
            };
        } as any);

    polyline.exit()
        .remove();
  }

  createCoolerElement(): void {
    // Create the SVG and the necessary containers within it
    // Store a reference to the top level SVG container
    this.svg = d3.select("#coolChartCont")
    .insert("svg", "span")
    .append("g");

    this.svg.append("g")
    .attr("class", "slices");
    this.svg.append("g")
    .attr("class", "labels");
    this.svg.append("g")
    .attr("class", "lines");

    this.pie = d3.pie()          // Create the pie chart...
    .sort(null)                 // ...without sorting the data...
    .value(function(d) {        // ...using the budget property of any data.
      return (d as any as BudgetCategory).budget;
    });

    PieComponent.arc = d3.arc()          // Create an arc for the pie slices...
    .outerRadius(this.radius * 0.8)  // ...that fills from 0.8*r units...
    .innerRadius(this.radius * 0.4); // ...to 0.4*r units with color.

    this.outerArc = d3.arc()     // Create the arc for the lines...
    .innerRadius(this.radius * 0.9)  // ...just outside of the arc for the slices.
    .outerRadius(this.radius * 0.9);

    // Center the top level svg container
    this.svg.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  }
}
