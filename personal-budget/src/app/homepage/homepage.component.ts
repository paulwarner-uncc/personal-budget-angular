import { Component, DoCheck, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables} from 'chart.js';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';
import { DataService } from '../data.service';
import { BudgetCategory, Budget, BudgetData } from '../app.component';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})

export class HomepageComponent implements OnInit {
  /* private dataSource: BudgetData = {
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
  }; */

  // Define the size of the SVG
  private readonly width = 475;
  private readonly height = 325;
  private readonly radius = Math.min(this.width, this.height) / 2;

  private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null;
  private pie: d3.Pie<any, number | { valueOf(): number; }> | null = null;
  public static arc: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private outerArc: d3.Arc<any, d3.DefaultArcObject> | null = null;
  private slice: d3.Selection<d3.BaseType, d3.PieArcDatum<number | {valueOf(): number;}>, d3.BaseType, unknown> | null = null;

  private subscription: Subscription | null = null;

  private key(d: any) {
    return d.data.title;
  }

  constructor(private dataService: DataService) {
    // Register charts to prevent an error
    // Thanks to https://stackoverflow.com/a/65215084
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.subscription = this.dataService.dataChange.subscribe((budget: Budget) => {
      this.createCharts(budget);
    });
  }

  createCharts(budget: Budget): void {
    /* let color = d3.scaleOrdinal()
      .domain(page.dataSource.labels)
      .range(page.dataSource.datasets[0].backgroundColor); */
    //d3.scaleOrdinal()
    //d3;

    this.createChart();
    //this.createCoolerChart(res.myBudget, color);
  }

  createChart(): void {
    let ctx: CanvasRenderingContext2D = (document.getElementById("myChart") as HTMLCanvasElement)
      .getContext("2d")!;
    let myPieChart = new Chart(ctx, {
        type: "pie",
        data: this.dataService.getDataSource()
    });
  }

  createCoolerChart(data: BudgetCategory[], color: any): void {
    //this.createCoolerElement();

    /* ------- PIE SLICES -------*/
    // Get all the slices and populate with data
    this.slice = this.svg!.select(".slices").selectAll("path.slice")
        .data(this.pie!(data as any), this.key);

    // Fill each pie wedge with the correct color
    this.slice.enter()
        .insert("path")
        .style("fill", function(d: any) { return color((d.data as any).title) as string; })
        .attr("class", "slice");

    // Use the transition animations to correctly position the slices
    /* this.slice.transition()
      .attrTween("d", function(d) {
        (this as any)._current = (this as any)._current || d;
        var interpolate = d3.interpolate((this as any)._current, d);
        (this as any)._current = interpolate(0);
        return function(t: number) {
          return HomepageComponent.arc!(interpolate(t));
        }
      }); */

    this.slice.exit()
        .remove();

    return;

    /* ------- TEXT LABELS -------*/

    /* var text = this.svg!.select(".labels").selectAll("text")
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
        .remove(); */

    /* ------- SLICE TO TEXT POLYLINES -------*/

    /* var polyline = this.svg!.select(".lines").selectAll("polyline")
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
        .remove(); */
  }

  /* createCoolerElement(): void {
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

    this.arc = d3.arc()          // Create an arc for the pie slices...
    .outerRadius(this.radius * 0.8)  // ...that fills from 0.8*r units...
    .innerRadius(this.radius * 0.4); // ...to 0.4*r units with color.

    this.outerArc = d3.arc()     // Create the arc for the lines...
    .innerRadius(this.radius * 0.9)  // ...just outside of the arc for the slices.
    .outerRadius(this.radius * 0.9);

    // Center the top level svg container
    this.svg.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  }*/
}
