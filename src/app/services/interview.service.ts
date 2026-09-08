
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewData {
  id: number | string;
  candidate: string;
  position: string;
  interviewer: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  private apiUrl = 'https://talentflow-api-zkmy.onrender.com/interviews';

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<InterviewData[]> {
    return this.http.get<InterviewData[]>(this.apiUrl);
  }

  addInterview(
    interview: InterviewData
  ): Observable<InterviewData> {
    return this.http.post<InterviewData>(
      this.apiUrl,
      interview
    );
  }

  updateInterview(
    updatedInterview: InterviewData
  ): Observable<InterviewData> {
    return this.http.put<InterviewData>(
      `${this.apiUrl}/${updatedInterview.id}`,
      updatedInterview
    );
  }

  deleteInterview(
    id: number | string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  clearInterviews(): Observable<void> {
    return this.http.delete<void>(
      this.apiUrl
    );
  }
}
