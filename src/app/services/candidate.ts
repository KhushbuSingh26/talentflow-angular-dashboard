
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CandidateData {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: string;
  appliedDate?: string;
  jobId?: string | number | null;
}

@Injectable({
  providedIn: 'root',
})
export class CandidateService {

  private apiUrl =
    'https://talentflow-api-zkmy.onrender.com/candidates';

  constructor(
    private http: HttpClient
  ) {}

  getCandidates(): Observable<CandidateData[]> {

    return this.http.get<CandidateData[]>(
      this.apiUrl
    );

  }

  addCandidate(
    candidate: CandidateData
  ): Observable<CandidateData> {

    return this.http.post<CandidateData>(
      this.apiUrl,
      candidate
    );

  }

  updateCandidate(
    updatedCandidate: CandidateData
  ): Observable<CandidateData> {

    return this.http.put<CandidateData>(
      `${this.apiUrl}/${updatedCandidate.id}`,
      updatedCandidate
    );

  }

  deleteCandidate(
    id: string | number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }

  clearCandidates(): Observable<void> {

    return this.http.delete<void>(
      this.apiUrl
    );

  }

}
