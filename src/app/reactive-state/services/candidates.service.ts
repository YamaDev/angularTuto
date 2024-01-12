import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, delay, Observable, tap} from "rxjs";
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
  get candidate$(): Observable<Candidate[]>{
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
}
