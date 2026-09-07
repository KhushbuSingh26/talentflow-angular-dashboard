import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobData {
  id: string | number;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  applicants: number;
}

@Injectable({
  providedIn: 'root',
})
export class JobService {

  private apiUrl = 'http://localhost:3000/jobs';

  constructor(
    private http: HttpClient
  ) {}

  getJobs(): Observable<JobData[]> {

    return this.http.get<JobData[]>(
      this.apiUrl
    );

  }

  addJob(
    job: JobData
  ): Observable<JobData> {

    return this.http.post<JobData>(
      this.apiUrl,
      job
    );

  }

  updateJob(
    updatedJob: JobData
  ): Observable<JobData> {

    return this.http.put<JobData>(
      `${this.apiUrl}/${updatedJob.id}`,
      updatedJob
    );

  }

  deleteJob(
    id: string | number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }

  clearJobs(): Observable<void> {

    return this.http.delete<void>(
      this.apiUrl
    );

  }

}