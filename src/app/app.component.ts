import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ArcElement, Chart, PieController, Tooltip } from 'chart.js';
import { Octokit } from 'octokit';
import { BehaviorSubject, combineLatest, concatMap, debounceTime, filter, from, map, of, startWith, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

Chart.register(PieController, ArcElement, Tooltip);

// Octokit does not expose these types. We have to work them out for ourselves.
type SearchResult = Parameters<NonNullable<Parameters<ReturnType<Octokit['rest']['search']['repos']>['then']>[0]>>[0]['data']['items'][0];
type RepoIssue = Parameters<NonNullable<Parameters<ReturnType<Octokit['rest']['issues']['list']>['then']>[0]>>[0]['data'][0];
type IssueType = NonNullable<Parameters<Octokit['rest']['issues']['list']>[0]>['state'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  @ViewChild('pieChart')
  readonly pieChart!: ElementRef<HTMLCanvasElement>;
  readonly searchControl = new FormControl('');
  readonly issueType$ = new BehaviorSubject<IssueType>('all');
  readonly loadingResults$ = new BehaviorSubject(false);
  readonly loadingRepo$ = new BehaviorSubject(false);
  readonly selectedRepository$ = new BehaviorSubject<SearchResult | null>(null);
  readonly selectedRepoIssues$ = new BehaviorSubject<RepoIssue[]>([]);
  readonly searchSuggestions$ = this.getSearchSuggestions();
  readonly selectedRepoIssuesFiltered$ = this.getSelectedRepoIssuesFiltered();
  readonly octokit = new Octokit({ auth: environment.githubAccessToken });
  readonly trackSearchSuggestions = (index: number, listItem: SearchResult) => listItem.id;
  readonly displayFn = (listItem: SearchResult) => listItem?.name;
  chart!: Chart;

  onSearchSuggestionSelected(selection: SearchResult) {
    this.selectedRepository$.next(selection);
    this.loadingRepo$.next(true);
    from(this.octokit.rest.issues.list({ baseUrl: selection.url, state: 'all' })).pipe(
      tap(r => this.selectedRepoIssues$.next(r.data)),
      tap(() => this.chart?.destroy()),
      tap(r => this.chart = new Chart(this.pieChart.nativeElement, {
        type: 'pie',
        data: {
          labels: ['Open', 'Closed'],
          datasets: [{
            data: [ r.data.filter(d => d.state === 'open').length, r.data.filter(d => d.state === 'closed').length ],
            backgroundColor: ['red', 'green'],
          }],
        },
      })),
      tap(() => this.loadingRepo$.next(false)),
    ).subscribe();
  }

  private getSearchSuggestions() {
    return this.searchControl.valueChanges.pipe(
      tap(() => this.loadingResults$.next(true)),
      debounceTime(500),
      concatMap(q => (!q || typeof (q) !== 'string') ? of(null) : from(this.octokit.rest.search.repos({ q }))),
      map(result => !result ? [] : result.data.items),
      tap(() => this.loadingResults$.next(false)),
    )
  }

  private getSelectedRepoIssuesFiltered() {
    return combineLatest([
      this.selectedRepoIssues$.pipe(startWith([])),
      this.issueType$.pipe(startWith('all')),
    ]).pipe(
      map(([issues, type]) => type === 'all' ? issues : issues.filter(i => i.state === type)),
    )
  }

}
