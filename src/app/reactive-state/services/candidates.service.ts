import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, delay, map, Observable, startWith, switchMap, take, tap} from "rxjs";
import {Candidate} from "../models/candidate.model";
import {environment} from "../../../environments/environment";

@Injectable()

export class CandidatesService {
  constructor(private http: HttpClient) {  }

  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable()
  }

  private _candidates$ = new BehaviorSubject<Candidate[]>([]); // attention possède un cache
  get candidates$(): Observable<Candidate[]>{
    return this._candidates$.asObservable()
  }

  private lastCandidatesLoaded = 0;
  private setLoadingStatus(loading: boolean){
    this._loading$.next(loading);
  }

  getCandidateFromServer(){
    if (Date.now() - this.lastCandidatesLoaded <= 300000) {
      return
    }
    this.setLoadingStatus(true);
    this.http.get<Candidate[]>(`${environment.apiUrl}/candidates`).pipe(
      delay(1000),
      tap(candidates => {
        this.lastCandidatesLoaded = Date.now();
        this._candidates$.next(candidates);
        this.setLoadingStatus(false);
      }),
    ).subscribe()
  }

  getCandidateById(id: number): Observable<Candidate> {
    if (!this.lastCandidatesLoaded){
      this.getCandidateFromServer();
    }
    return this.candidates$.pipe(
      map(candidates => candidates.filter(candidate => candidate.id === id)[0])
    );
  }

  refuseCandidate(id:number):void{
    this.setLoadingStatus(true);
    this.http.delete(`${environment.apiUrl}/candidates/${id}`).pipe(
      delay(1000),
      switchMap(()=>this.candidates$),
      take(1),
      map(candidates => candidates.filter(candidates => candidates.id !== id)),
      tap(candidates => {
        this._candidates$.next(candidates);
        this.setLoadingStatus(false)
      })
    ).subscribe();
  }

}
